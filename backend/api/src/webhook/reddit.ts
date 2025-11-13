import { createWebhook, deleteWebhook } from './registry';
import { ActionsId } from '../../../shared/prisma/workflowData';
import prisma from '../prismaClient';

/**
 * Reddit New Post Action
 * Déclenche quand un nouveau post est créé dans un subreddit spécifique
 * 
 * Configuration requise : nom du subreddit (sans r/)
 * Exemple : "programming" pour r/programming
 */

// ============================================================================
// Reddit New Post (ActionsId.redditNewPost = 6)
// ============================================================================

createWebhook[ActionsId.redditNewPost] = async (workflowId: number, actionData: string[]) => {
  console.log(`📱 Configuring Reddit New Post for workflow: ${workflowId} with data:`, actionData);

  // Vérifier que le workflow existe
  const workflow = await prisma.workflows.findUnique({
    where: { id: workflowId },
    include: {
      user: {
        include: {
          userService: {
            where: {
              serviceId: 3 // Reddit service ID
            }
          }
        }
      }
    }
  });

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  // Vérifier que l'utilisateur a connecté Reddit
  const redditConnection = workflow.user.userService.find((us: any) => us.serviceId === 3);
  if (!redditConnection) {
    throw new Error('User has not connected Reddit account. Please connect Reddit first.');
  }

  // Vérifier que le token Reddit existe
  if (!redditConnection.token) {
    throw new Error('Reddit token not found. Please reconnect your Reddit account.');
  }

  // Valider le subreddit name
  if (!actionData[0] || !actionData[0].trim()) {
    throw new Error('Subreddit name is required');
  }

  const subreddit = actionData[0].trim().toLowerCase();

  // Valider format (pas de r/, pas d'espaces, alphanumerique + underscore)
  if (!/^[a-z0-9_]+$/.test(subreddit)) {
    throw new Error('Invalid subreddit name. Use only letters, numbers and underscores (no r/ prefix)');
  }

  // Vérifier que le subreddit existe (appel API Reddit)
  try {
    const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/about`, {
      headers: {
        'Authorization': `Bearer ${redditConnection.token}`,
        'User-Agent': 'Area-App/1.0.0'
      }
    });

    if (response.status === 404) {
      throw new Error(`Subreddit r/${subreddit} does not exist`);
    }

    if (response.status === 403) {
      throw new Error(`Subreddit r/${subreddit} is private or banned`);
    }

    if (!response.ok) {
      console.error(`Reddit API error when checking subreddit: ${response.status}`);
      // On continue quand même, le worker gérera l'erreur
    }
  } catch (error) {
    console.error('Error validating subreddit:', error);
    // On log mais on ne bloque pas la création
  }

  console.log(`✅ Reddit New Post configured for workflow ${workflowId}`);
  console.log(`   User ${workflow.userId} has Reddit connected`);
  console.log(`   Subreddit: r/${subreddit}`);
  console.log(`   Worker will check for new posts every 2 minutes`);

  // Log dans la DB
  await prisma.log.create({
    data: {
      level: 'info',
      message: `Reddit New Post action configured for workflow ${workflowId} (r/${subreddit})`,
      context: 'Reddit Webhook',
      metadata: {
        workflowId,
        userId: workflow.userId,
        subreddit,
        actionId: ActionsId.redditNewPost
      }
    }
  });
};

deleteWebhook[ActionsId.redditNewPost] = async (workflowId: number, actionData: string[]) => {
  console.log(`🗑️  Cleaning up Reddit New Post for workflow: ${workflowId}`);
  
  // Pas de webhook externe à supprimer pour Reddit
  // Le worker arrêtera automatiquement de vérifier ce workflow
  
  await prisma.log.create({
    data: {
      level: 'info',
      message: `Reddit New Post action removed for workflow ${workflowId}`,
      context: 'Reddit Webhook',
      metadata: {
        workflowId,
        subreddit: actionData[0],
        actionId: ActionsId.redditNewPost
      }
    }
  });
  
  console.log(`✅ Reddit New Post cleanup completed for workflow ${workflowId}`);
};
