import { createWebhook, deleteWebhook } from './registry';
import { ActionsId } from '../../../shared/prisma/workflowData';
import prisma from '../prismaClient';

/**
 * Slack New Message Action
 * Déclenche quand un nouveau message est posté dans un channel Slack spécifique
 * 
 * Configuration requise : ID du channel Slack
 * Exemple : "C01234ABCDE"
 */

// ============================================================================
// Slack New Message (ActionsId.slackNewMessage = 7)
// ============================================================================

createWebhook[ActionsId.slackNewMessage] = async (workflowId: number, actionData: string[]) => {
  console.log(`💬 Configuring Slack New Message for workflow: ${workflowId} with data:`, actionData);

  // Vérifier que le workflow existe
  const workflow = await prisma.workflows.findUnique({
    where: { id: workflowId },
    include: {
      user: {
        include: {
          userService: {
            where: {
              serviceId: 4 // Slack service ID
            }
          }
        }
      }
    }
  });

  if (!workflow) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  // Vérifier que l'utilisateur a connecté Slack
  const slackConnection = workflow.user.userService.find((us: any) => us.serviceId === 4);
  if (!slackConnection) {
    throw new Error('User has not connected Slack account. Please connect Slack first.');
  }

  // Vérifier que le token Slack existe
  if (!slackConnection.token) {
    throw new Error('Slack token not found. Please reconnect your Slack account.');
  }

  // Valider le channel ID
  if (!actionData[0] || !actionData[0].trim()) {
    throw new Error('Slack channel ID is required');
  }

  const channelId = actionData[0].trim();

  // Valider format (channel ID commence par C ou G)
  if (!/^[CG][A-Z0-9]{8,}$/.test(channelId)) {
    throw new Error('Invalid Slack channel ID format. Should start with C or G followed by alphanumeric characters');
  }

  // Vérifier que le channel existe et que le bot y a accès
  try {
    const response = await fetch('https://slack.com/api/conversations.info', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${slackConnection.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ channel: channelId })
    });

    const data: any = await response.json();

    if (!data.ok) {
      if (data.error === 'channel_not_found') {
        throw new Error(`Slack channel ${channelId} does not exist`);
      }
      if (data.error === 'not_in_channel') {
        throw new Error(`Bot is not a member of channel ${channelId}. Please invite the bot to this channel first.`);
      }
      console.error(`Slack API error when checking channel: ${data.error}`);
      // On continue quand même, le worker gérera l'erreur
    }

    console.log(`✅ Slack channel validated: ${data.channel?.name || channelId}`);
  } catch (error) {
    console.error('Error validating Slack channel:', error);
    // On log mais on ne bloque pas la création
  }

  console.log(`✅ Slack New Message configured for workflow ${workflowId}`);
  console.log(`   User ${workflow.userId} has Slack connected`);
  console.log(`   Channel ID: ${channelId}`);
  console.log(`   Worker will check for new messages every 1 minute`);

  // Log dans la DB
  await prisma.log.create({
    data: {
      level: 'info',
      message: `Slack New Message action configured for workflow ${workflowId} (channel: ${channelId})`,
      context: 'Slack Webhook',
      metadata: {
        workflowId,
        userId: workflow.userId,
        channelId,
        actionId: ActionsId.slackNewMessage
      }
    }
  });
};

deleteWebhook[ActionsId.slackNewMessage] = async (workflowId: number, actionData: string[]) => {
  console.log(`🗑️  Cleaning up Slack New Message for workflow: ${workflowId}`);
  
  // Pas de webhook externe à supprimer pour Slack
  // Le worker arrêtera automatiquement de vérifier ce workflow
  
  await prisma.log.create({
    data: {
      level: 'info',
      message: `Slack New Message action removed for workflow ${workflowId}`,
      context: 'Slack Webhook',
      metadata: {
        workflowId,
        channelId: actionData[0],
        actionId: ActionsId.slackNewMessage
      }
    }
  });
  
  console.log(`✅ Slack New Message cleanup completed for workflow ${workflowId}`);
};
