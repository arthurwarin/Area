import prisma from '../prismaClient';
import { ActionsId } from '../../../shared/prisma/workflowData';
import { reactionsList } from '../reactions/registry';

/**
 * Spotify Worker
 * 
 * Vérifie toutes les 2 minutes les workflows avec action Spotify Track Saved.
 * Pour chaque workflow, récupère les tracks récemment likées et déclenche
 * la reaction si de nouvelles tracks sont détectées.
 * 
 * Architecture:
 * 1. Query tous les workflows avec actionId = ActionsId.spotifyTrackSaved
 * 2. Pour chaque workflow, récupère le token Spotify de l'utilisateur
 * 3. Appelle l'API Spotify pour récupérer les tracks récemment likées
 * 4. Compare avec la dernière track connue (stockée en DB)
 * 5. Si nouvelles tracks détectées, déclenche la reaction
 */

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  added_at: string;
}

interface SpotifySavedTracksResponse {
  items: {
    added_at: string;
    track: SpotifyTrack;
  }[];
}

/**
 * Récupère les tracks récemment likées d'un utilisateur Spotify
 */
async function getRecentlySavedTracks(accessToken: string, limit = 5): Promise<SpotifyTrack[]> {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Spotify token expired or invalid');
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data: SpotifySavedTracksResponse = await response.json();
    
    return data.items.map(item => ({
      ...item.track,
      added_at: item.added_at
    }));
  } catch (error) {
    console.error('Error fetching Spotify saved tracks:', error);
    throw error;
  }
}

/**
 * Vérifie un workflow Spotify Track Saved
 */
async function checkSpotifyWorkflow(workflow: any): Promise<void> {
  try {
    // Récupérer le token Spotify de l'utilisateur
    const userService = await prisma.userService.findFirst({
      where: {
        userId: workflow.userId,
        serviceId: 5 // Spotify
      }
    });

    if (!userService || !userService.token) {
      console.log(`⚠️  User ${workflow.userId} has no Spotify token, skipping workflow ${workflow.id}`);
      return;
    }

    // Récupérer les tracks récemment likées
    const recentTracks = await getRecentlySavedTracks(userService.token, 1);
    
    if (recentTracks.length === 0) {
      console.log(`   No saved tracks found for workflow ${workflow.id}`);
      return;
    }

    const latestTrack = recentTracks[0];
    const latestTrackId = latestTrack.id;
    const latestTrackAddedAt = new Date(latestTrack.added_at);

    // Vérifier si on a déjà vu cette track
    // On stocke le dernier trackId dans actionData[0]
    const lastKnownTrackId = workflow.actionData[0];

    if (lastKnownTrackId === latestTrackId) {
      console.log(`   No new tracks for workflow ${workflow.id} (last: ${latestTrackId})`);
      return;
    }

    // Nouvelle track détectée !
    console.log(`🎵 New track saved detected for workflow ${workflow.id}!`);
    console.log(`   Track: "${latestTrack.name}" by ${latestTrack.artists.map(a => a.name).join(', ')}`);
    console.log(`   Album: ${latestTrack.album.name}`);
    console.log(`   Added at: ${latestTrackAddedAt.toISOString()}`);

    // Vérifier que la track a été ajoutée récemment (moins de 5 minutes)
    // Pour éviter de déclencher sur des anciennes tracks au premier lancement
    const now = new Date();
    const timeDiff = now.getTime() - latestTrackAddedAt.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 5 && !lastKnownTrackId) {
      // Première exécution, on initialise juste le trackId
      console.log(`   First run for workflow ${workflow.id}, initializing with current track`);
      await prisma.workflows.update({
        where: { id: workflow.id },
        data: {
          actionData: [latestTrackId]
        }
      });
      return;
    }

    // Déclencher la reaction
    const reactionFunction = reactionsList[workflow.reactionId];
    if (!reactionFunction) {
      console.error(`❌ No reaction handler found for reactionId ${workflow.reactionId}`);
      return;
    }

    // Enrichir reactionData avec les infos de la track
    // On ajoute les métadonnées de la track pour que les reactions puissent les utiliser
    const enrichedReactionData = [
      ...workflow.reactionData,
      // Métadonnées optionnelles (reactions peuvent les ignorer)
      `Track: ${latestTrack.name}`,
      `Artist: ${latestTrack.artists.map(a => a.name).join(', ')}`,
      `Album: ${latestTrack.album.name}`
    ];

    console.log(`   Triggering reaction ${workflow.reactionId} for workflow ${workflow.id}`);
    await reactionFunction(workflow.userId, enrichedReactionData);

    // Mettre à jour le dernier trackId connu
    await prisma.workflows.update({
      where: { id: workflow.id },
      data: {
        actionData: [latestTrackId]
      }
    });

    // Log dans la DB
    await prisma.log.create({
      data: {
        level: 'info',
        message: `Spotify workflow ${workflow.id} triggered: new track "${latestTrack.name}"`,
        context: 'Spotify Worker',
        metadata: {
          workflowId: workflow.id,
          userId: workflow.userId,
          trackId: latestTrackId,
          trackName: latestTrack.name,
          artistName: latestTrack.artists.map(a => a.name).join(', '),
          albumName: latestTrack.album.name
        }
      }
    });

    console.log(`✅ Spotify workflow ${workflow.id} triggered successfully`);

  } catch (error) {
    console.error(`❌ Error checking Spotify workflow ${workflow.id}:`, error);
    
    await prisma.log.create({
      data: {
        level: 'error',
        message: `Spotify Worker error for workflow ${workflow.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: 'Spotify Worker',
        metadata: {
          workflowId: workflow.id,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
  }
}

/**
 * Vérifie tous les workflows Spotify Track Saved
 */
async function checkSpotifyWorkflows(): Promise<void> {
  try {
    // Récupérer tous les workflows avec action Spotify Track Saved
    const workflows = await prisma.workflows.findMany({
      where: {
        actionId: ActionsId.spotifyTrackSaved
      }
    });

    if (workflows.length === 0) {
      return;
    }

    console.log(`🎵 Checking ${workflows.length} Spotify workflow(s)...`);

    // Vérifier chaque workflow
    for (const workflow of workflows) {
      await checkSpotifyWorkflow(workflow);
    }

  } catch (error) {
    console.error('❌ Spotify Worker error:', error);
    
    await prisma.log.create({
      data: {
        level: 'error',
        message: `Spotify Worker error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: 'Spotify Worker',
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
  }
}

/**
 * Démarre le worker Spotify
 * Vérifie toutes les 2 minutes (120 secondes)
 */
export function startSpotifyWorker(): void {
  console.log('🚀 Starting Spotify Worker...');
  console.log('🎵 Will check Spotify workflows every 2 minutes');

  // Vérifier immédiatement au démarrage
  checkSpotifyWorkflows();

  // Puis toutes les 2 minutes
  setInterval(() => {
    checkSpotifyWorkflows();
  }, 120000); // 2 minutes = 120000ms
}
