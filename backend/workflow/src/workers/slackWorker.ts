import prisma from '../prismaClient';
import { ActionsId } from '../../../shared/prisma/workflowData';
import { reactionsList } from '../reactions/registry';

/**
 * Slack Worker
 * 
 * Vérifie toutes les 1 minute les workflows avec action Slack New Message.
 * Pour chaque workflow, récupère les nouveaux messages dans le channel configuré
 * et déclenche la reaction si de nouveaux messages sont détectés.
 * 
 * Architecture:
 * 1. Query tous les workflows avec actionId = ActionsId.slackNewMessage
 * 2. Pour chaque workflow, récupère le token Slack de l'utilisateur
 * 3. Appelle l'API Slack pour récupérer les messages récents du channel
 * 4. Compare avec le dernier message connu (stocké en DB)
 * 5. Si nouveaux messages détectés, déclenche la reaction
 */

interface SlackMessage {
  type: string;
  user?: string;
  text: string;
  ts: string;
  channel?: string;
  bot_id?: string;
}

interface SlackConversationsHistoryResponse {
  ok: boolean;
  messages: SlackMessage[];
  has_more: boolean;
  error?: string;
}

/**
 * Récupère les messages récents d'un channel Slack
 */
async function getRecentMessages(accessToken: string, channelId: string, limit = 5): Promise<SlackMessage[]> {
  try {
    const response = await fetch('https://slack.com/api/conversations.history', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: channelId,
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error(`Slack API HTTP error: ${response.status}`);
    }

    const data: SlackConversationsHistoryResponse = await response.json();

    if (!data.ok) {
      if (data.error === 'not_in_channel') {
        throw new Error('Bot is not a member of this channel');
      }
      if (data.error === 'channel_not_found') {
        throw new Error('Channel not found');
      }
      throw new Error(`Slack API error: ${data.error}`);
    }

    // Filtrer les messages (ignorer les messages de bot, threads, etc.)
    return data.messages.filter(msg => 
      msg.type === 'message' && 
      !msg.bot_id && // Ignorer les bots
      msg.user // Doit avoir un user
    );
  } catch (error) {
    console.error('Error fetching Slack messages:', error);
    throw error;
  }
}

/**
 * Récupère les infos d'un user Slack
 */
async function getUserInfo(accessToken: string, userId: string): Promise<{ name: string; real_name: string }> {
  try {
    const response = await fetch('https://slack.com/api/users.info', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user: userId })
    });

    const data: any = await response.json();
    
    if (!data.ok) {
      return { name: userId, real_name: 'Unknown User' };
    }

    return {
      name: data.user.name,
      real_name: data.user.real_name || data.user.name
    };
  } catch (error) {
    console.error('Error fetching Slack user info:', error);
    return { name: userId, real_name: 'Unknown User' };
  }
}

/**
 * Vérifie un workflow Slack New Message
 */
async function checkSlackWorkflow(workflow: any): Promise<void> {
  try {
    // Récupérer le token Slack de l'utilisateur
    const userService = await prisma.userService.findFirst({
      where: {
        userId: workflow.userId,
        serviceId: 4 // Slack
      }
    });

    if (!userService || !userService.token) {
      console.log(`⚠️  User ${workflow.userId} has no Slack token, skipping workflow ${workflow.id}`);
      return;
    }

    // Récupérer le channel ID depuis actionData
    const channelId = workflow.actionData[0];
    if (!channelId) {
      console.error(`❌ Workflow ${workflow.id} has no channel ID configured`);
      return;
    }

    // Récupérer les messages récents
    const recentMessages = await getRecentMessages(userService.token, channelId, 1);
    
    if (recentMessages.length === 0) {
      console.log(`   No messages found in channel ${channelId} for workflow ${workflow.id}`);
      return;
    }

    const latestMessage = recentMessages[0];
    const latestMessageTs = latestMessage.ts;

    // Vérifier si on a déjà vu ce message
    // On stocke le dernier message timestamp dans actionData[1]
    const lastKnownTs = workflow.actionData[1];

    if (lastKnownTs === latestMessageTs) {
      console.log(`   No new messages in channel ${channelId} for workflow ${workflow.id} (last: ${latestMessageTs})`);
      return;
    }

    // Nouveau message détecté !
    console.log(`💬 New message detected in Slack channel for workflow ${workflow.id}!`);
    console.log(`   Channel: ${channelId}`);
    console.log(`   Message: "${latestMessage.text.substring(0, 50)}${latestMessage.text.length > 50 ? '...' : ''}"`);
    console.log(`   User: ${latestMessage.user}`);

    // Vérifier que le message a été créé récemment (moins de 2 minutes)
    // Pour éviter de déclencher sur des anciens messages au premier lancement
    const messageTime = parseFloat(latestMessageTs) * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeDiff = now - messageTime;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 2 && !lastKnownTs) {
      // Première exécution, on initialise juste le timestamp
      console.log(`   First run for workflow ${workflow.id}, initializing with current message`);
      await prisma.workflows.update({
        where: { id: workflow.id },
        data: {
          actionData: [channelId, latestMessageTs]
        }
      });
      return;
    }

    // Récupérer les infos du user
    const userInfo = await getUserInfo(userService.token, latestMessage.user!);

    // Déclencher la reaction
    const reactionFunction = reactionsList[workflow.reactionId];
    if (!reactionFunction) {
      console.error(`❌ No reaction handler found for reactionId ${workflow.reactionId}`);
      return;
    }

    // Enrichir reactionData avec les infos du message
    const enrichedReactionData = [
      ...workflow.reactionData,
      // Métadonnées optionnelles (reactions peuvent les ignorer)
      `Message: ${latestMessage.text}`,
      `User: ${userInfo.real_name} (@${userInfo.name})`,
      `Channel: ${channelId}`,
      `Timestamp: ${latestMessageTs}`
    ];

    console.log(`   Triggering reaction ${workflow.reactionId} for workflow ${workflow.id}`);
    await reactionFunction(workflow.userId, enrichedReactionData);

    // Mettre à jour le dernier timestamp connu
    await prisma.workflows.update({
      where: { id: workflow.id },
      data: {
        actionData: [channelId, latestMessageTs]
      }
    });

    // Log dans la DB
    await prisma.log.create({
      data: {
        level: 'info',
        message: `Slack workflow ${workflow.id} triggered: new message in channel ${channelId}`,
        context: 'Slack Worker',
        metadata: {
          workflowId: workflow.id,
          userId: workflow.userId,
          channelId,
          messageTs: latestMessageTs,
          messageText: latestMessage.text.substring(0, 100),
          messageUser: userInfo.name
        }
      }
    });

    console.log(`✅ Slack workflow ${workflow.id} triggered successfully`);

  } catch (error) {
    console.error(`❌ Error checking Slack workflow ${workflow.id}:`, error);
    
    await prisma.log.create({
      data: {
        level: 'error',
        message: `Slack Worker error for workflow ${workflow.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: 'Slack Worker',
        metadata: {
          workflowId: workflow.id,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
  }
}

/**
 * Vérifie tous les workflows Slack New Message
 */
async function checkSlackWorkflows(): Promise<void> {
  try {
    // Récupérer tous les workflows avec action Slack New Message
    const workflows = await prisma.workflows.findMany({
      where: {
        actionId: ActionsId.slackNewMessage
      }
    });

    if (workflows.length === 0) {
      return;
    }

    console.log(`💬 Checking ${workflows.length} Slack workflow(s)...`);

    // Vérifier chaque workflow
    for (const workflow of workflows) {
      await checkSlackWorkflow(workflow);
    }

  } catch (error) {
    console.error('❌ Slack Worker error:', error);
    
    await prisma.log.create({
      data: {
        level: 'error',
        message: `Slack Worker error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: 'Slack Worker',
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
  }
}

/**
 * Démarre le worker Slack
 * Vérifie toutes les 1 minute (60 secondes)
 */
export function startSlackWorker(): void {
  console.log('🚀 Starting Slack Worker...');
  console.log('💬 Will check Slack workflows every 1 minute');

  // Vérifier immédiatement au démarrage
  checkSlackWorkflows();

  // Puis toutes les 1 minute
  setInterval(() => {
    checkSlackWorkflows();
  }, 60000); // 1 minute = 60000ms
}
