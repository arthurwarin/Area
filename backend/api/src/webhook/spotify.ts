import { createWebhook, deleteWebhook } from './registry';
import { ActionsId } from '../../../shared/prisma/workflowData';
import prisma from '../prismaClient';

/**
 * Spotify Track Saved Action
 * Déclenche quand l'utilisateur like une nouvelle track sur Spotify
 * 
 * Cette action ne nécessite aucune configuration de la part de l'utilisateur.
 * Le worker Spotify vérifie régulièrement les nouvelles tracks likées.
 */

// ============================================================================
// Spotify Track Saved (ActionsId.spotifyTrackSaved = 5)
// ============================================================================

createWebhook[ActionsId.spotifyTrackSaved] = async (workflowId: number, actionData: string[]) => {
  console.log(`📱 Configuring Spotify Track Saved for workflow: ${workflowId}`);

  // Vérifier que le workflow existe
  const workflow = await prisma.workflows.findUnique({
    where: { id: workflowId },
    include: {
      user: {
        include: {
          userService: {
            where: {
              serviceId: 5 // Spotify service ID
            }
          }
        }
      }
    }
  });

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  // Vérifier que l'utilisateur a connecté Spotify
  const spotifyConnection = workflow.user.userService.find((us: any) => us.serviceId === 5);
  if (!spotifyConnection) {
    throw new Error('User has not connected Spotify account. Please connect Spotify first.');
  }

  // Vérifier que le token Spotify existe
  if (!spotifyConnection.token) {
    throw new Error('Spotify token not found. Please reconnect your Spotify account.');
  }

  console.log(`✅ Spotify Track Saved configured for workflow ${workflowId}`);
  console.log(`   User ${workflow.userId} has Spotify connected`);
  console.log(`   Worker will check for new liked tracks every 2 minutes`);

  // Log dans la DB
  await prisma.log.create({
    data: {
      level: 'info',
      message: `Spotify Track Saved action configured for workflow ${workflowId}`,
      context: 'Spotify Webhook',
      metadata: {
        workflowId,
        userId: workflow.userId,
        actionId: ActionsId.spotifyTrackSaved
      }
    }
  });
};

deleteWebhook[ActionsId.spotifyTrackSaved] = async (workflowId: number, actionData: string[]) => {
  console.log(`🗑️  Cleaning up Spotify Track Saved for workflow: ${workflowId}`);
  
  // Pas de webhook externe à supprimer pour Spotify
  // Le worker arrêtera automatiquement de vérifier ce workflow
  
  await prisma.log.create({
    data: {
      level: 'info',
      message: `Spotify Track Saved action removed for workflow ${workflowId}`,
      context: 'Spotify Webhook',
      metadata: {
        workflowId,
        actionId: ActionsId.spotifyTrackSaved
      }
    }
  });
  
  console.log(`✅ Spotify Track Saved cleanup completed for workflow ${workflowId}`);
};
