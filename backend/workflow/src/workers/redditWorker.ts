import prisma from '../prismaClient';
import { ActionsId } from '../../../shared/prisma/workflowData';
import { reactionsList } from '../reactions/registry';

/**
 * Reddit Worker
 * 
 * Vérifie toutes les 2 minutes les workflows avec action Reddit New Post.
 * Pour chaque workflow, récupère les nouveaux posts dans le subreddit configuré
 * et déclenche la reaction si de nouveaux posts sont détectés.
 * 
 * Architecture:
 * 1. Query tous les workflows avec actionId = ActionsId.redditNewPost
 * 2. Pour chaque workflow, récupère le token Reddit de l'utilisateur
 * 3. Appelle l'API Reddit pour récupérer les nouveaux posts du subreddit
 * 4. Compare avec le dernier post connu (stocké en DB)
 * 5. Si nouveaux posts détectés, déclenche la reaction
 */

interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  created_utc: number;
  url: string;
  selftext: string;
  score: number;
  num_comments: number;
  permalink: string;
}

interface RedditListingResponse {
  data: {
    children: {
      data: RedditPost;
    }[];
  };
}

/**
 * Récupère les nouveaux posts d'un subreddit
 */
async function getNewPosts(accessToken: string, subreddit: string, limit = 5): Promise<RedditPost[]> {
  try {
    const response = await fetch(
      `https://oauth.reddit.com/r/${subreddit}/new?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Area-App/1.0.0'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Reddit token expired or invalid');
      }
      if (response.status === 404) {
        throw new Error(`Subreddit r/${subreddit} not found`);
      }
      if (response.status === 403) {
        throw new Error(`Subreddit r/${subreddit} is private or banned`);
      }
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data: RedditListingResponse = await response.json();
    
    return data.data.children.map(child => child.data);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    throw error;
  }
}

/**
 * Vérifie un workflow Reddit New Post
 */
async function checkRedditWorkflow(workflow: any): Promise<void> {
  try {
    // Récupérer le token Reddit de l'utilisateur
    const userService = await prisma.userService.findFirst({
      where: {
        userId: workflow.userId,
        serviceId: 3 // Reddit
      }
    });

    if (!userService || !userService.token) {
      console.log(`⚠️  User ${workflow.userId} has no Reddit token, skipping workflow ${workflow.id}`);
      return;
    }

    // Récupérer le subreddit depuis actionData
    const subreddit = workflow.actionData[0];
    if (!subreddit) {
      console.error(`❌ Workflow ${workflow.id} has no subreddit configured`);
      return;
    }

    // Récupérer les nouveaux posts
    const newPosts = await getNewPosts(userService.token, subreddit, 1);
    
    if (newPosts.length === 0) {
      console.log(`   No posts found in r/${subreddit} for workflow ${workflow.id}`);
      return;
    }

    const latestPost = newPosts[0];
    const latestPostId = latestPost.id;
    const latestPostCreatedAt = new Date(latestPost.created_utc * 1000);

    // Vérifier si on a déjà vu ce post
    // On stocke le dernier postId dans actionData[1]
    const lastKnownPostId = workflow.actionData[1];

    if (lastKnownPostId === latestPostId) {
      console.log(`   No new posts in r/${subreddit} for workflow ${workflow.id} (last: ${latestPostId})`);
      return;
    }

    // Nouveau post détecté !
    console.log(`📝 New post detected in r/${subreddit} for workflow ${workflow.id}!`);
    console.log(`   Title: "${latestPost.title}"`);
    console.log(`   Author: u/${latestPost.author}`);
    console.log(`   Score: ${latestPost.score} | Comments: ${latestPost.num_comments}`);
    console.log(`   URL: https://reddit.com${latestPost.permalink}`);

    // Vérifier que le post a été créé récemment (moins de 5 minutes)
    // Pour éviter de déclencher sur des anciens posts au premier lancement
    const now = new Date();
    const timeDiff = now.getTime() - latestPostCreatedAt.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 5 && !lastKnownPostId) {
      // Première exécution, on initialise juste le postId
      console.log(`   First run for workflow ${workflow.id}, initializing with current post`);
      await prisma.workflows.update({
        where: { id: workflow.id },
        data: {
          actionData: [subreddit, latestPostId]
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

    // Enrichir reactionData avec les infos du post
    const enrichedReactionData = [
      ...workflow.reactionData,
      // Métadonnées optionnelles (reactions peuvent les ignorer)
      `Title: ${latestPost.title}`,
      `Author: u/${latestPost.author}`,
      `Subreddit: r/${latestPost.subreddit}`,
      `URL: https://reddit.com${latestPost.permalink}`,
      `Score: ${latestPost.score}`,
      `Comments: ${latestPost.num_comments}`
    ];

    console.log(`   Triggering reaction ${workflow.reactionId} for workflow ${workflow.id}`);
    await reactionFunction(workflow.userId, enrichedReactionData);

    // Mettre à jour le dernier postId connu
    await prisma.workflows.update({
      where: { id: workflow.id },
      data: {
        actionData: [subreddit, latestPostId]
      }
    });

    // Log dans la DB
    await prisma.log.create({
      data: {
        level: 'info',
        message: `Reddit workflow ${workflow.id} triggered: new post in r/${subreddit}`,
        context: 'Reddit Worker',
        metadata: {
          workflowId: workflow.id,
          userId: workflow.userId,
          subreddit,
          postId: latestPostId,
          postTitle: latestPost.title,
          postAuthor: latestPost.author,
          postUrl: `https://reddit.com${latestPost.permalink}`
        }
      }
    });

    console.log(`✅ Reddit workflow ${workflow.id} triggered successfully`);

  } catch (error) {
    console.error(`❌ Error checking Reddit workflow ${workflow.id}:`, error);
    
    await prisma.log.create({
      data: {
        level: 'error',
        message: `Reddit Worker error for workflow ${workflow.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: 'Reddit Worker',
        metadata: {
          workflowId: workflow.id,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
  }
}

/**
 * Vérifie tous les workflows Reddit New Post
 */
async function checkRedditWorkflows(): Promise<void> {
  try {
    // Récupérer tous les workflows avec action Reddit New Post
    const workflows = await prisma.workflows.findMany({
      where: {
        actionId: ActionsId.redditNewPost
      }
    });

    if (workflows.length === 0) {
      return;
    }

    console.log(`📝 Checking ${workflows.length} Reddit workflow(s)...`);

    // Vérifier chaque workflow
    for (const workflow of workflows) {
      await checkRedditWorkflow(workflow);
    }

  } catch (error) {
    console.error('❌ Reddit Worker error:', error);
    
    await prisma.log.create({
      data: {
        level: 'error',
        message: `Reddit Worker error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: 'Reddit Worker',
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
  }
}

/**
 * Démarre le worker Reddit
 * Vérifie toutes les 2 minutes (120 secondes)
 */
export function startRedditWorker(): void {
  console.log('🚀 Starting Reddit Worker...');
  console.log('📝 Will check Reddit workflows every 2 minutes');

  // Vérifier immédiatement au démarrage
  checkRedditWorkflows();

  // Puis toutes les 2 minutes
  setInterval(() => {
    checkRedditWorkflows();
  }, 120000); // 2 minutes = 120000ms
}
