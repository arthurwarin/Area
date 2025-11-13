import { PrismaClient } from '../../shared/prisma/client';
import { ServicesId, ActionsId, ReactionsId } from '../../shared/prisma/workflowData'

const prisma = new PrismaClient();

async function main() {
	try {
		console.log("🔧 Setting up database...");

		// Services
		await prisma.services.create({
			data: {
				id: ServicesId.github,
				name: "github"
			}
		});

		await prisma.services.create({
			data: {
				id: ServicesId.discord,
				name: "discord"
			}
		});

		await prisma.services.create({
			data: {
				id: ServicesId.reddit,
				name: "reddit"
			}
		});

		await prisma.services.create({
			data: {
				id: ServicesId.slack,
				name: "slack"
			}
		});

		await prisma.services.create({
			data: {
				id: ServicesId.spotify,
				name: "spotify"
			}
		});

		await prisma.services.create({
			data: {
				id: ServicesId.timer,
				name: "timer"
			}
		});

		console.log("✅ Services créés");

		// Actions
		await prisma.actions.create({
			data: {
				id: ActionsId.githubPush,
				serviceId: ServicesId.github,
				name: "GitHub Push",
				description: "Triggered when code is pushed to a repository",
				data: ["repositoryOwner", "repositoryName"]
			}
		});

		// Actions Timer
		await prisma.actions.create({
			data: {
				id: ActionsId.timerDaily,
				serviceId: ServicesId.timer,
				name: "Timer Daily",
				description: "Triggers every day at a specific time (HH:MM format)",
				data: ["time"]
			}
		});

		await prisma.actions.create({
			data: {
				id: ActionsId.timerDate,
				serviceId: ServicesId.timer,
				name: "Timer Annual Date",
				description: "Triggers every year on a specific date (DD/MM format)",
				data: ["date"]
			}
		});

		await prisma.actions.create({
			data: {
				id: ActionsId.timerFutureDate,
				serviceId: ServicesId.timer,
				name: "Timer Future Date",
				description: "Triggers once after X days",
				data: ["daysAhead"]
			}
		});

		// Action Spotify
		await prisma.actions.create({
			data: {
				id: ActionsId.spotifyTrackSaved,
				serviceId: ServicesId.spotify,
				name: "Spotify Track Saved",
				description: "Triggers when you save/like a new track on Spotify",
				data: [] // Pas de configuration nécessaire
			}
		});

		// Action Reddit
		await prisma.actions.create({
			data: {
				id: ActionsId.redditNewPost,
				serviceId: ServicesId.reddit,
				name: "Reddit New Post",
				description: "Triggers when a new post is created in a specific subreddit",
				data: ["subreddit"] // Nom du subreddit (sans r/)
			}
		});

		// Action Slack
		await prisma.actions.create({
			data: {
				id: ActionsId.slackNewMessage,
				serviceId: ServicesId.slack,
				name: "Slack New Message",
				description: "Triggers when a new message is posted in a Slack channel",
				data: ["channelId"] // ID du channel Slack (ex: C01234ABCDE)
			}
		});

		console.log("✅ Actions créées");

		// Reactions Discord
		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordMessage,
				serviceId: ServicesId.discord,
				name: "Send Discord Message",
				description: "Send a message to a Discord channel",
				data: ["channelId", "message"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordDM,
				serviceId: ServicesId.discord,
				name: "Send Discord DM",
				description: "Send a direct message to a Discord user",
				data: ["discordUserId", "message"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordCreateChannel,
				serviceId: ServicesId.discord,
				name: "Create Discord Channel",
				description: "Create a new channel in a Discord server",
				data: ["guildId", "channelName", "channelType"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordAddRole,
				serviceId: ServicesId.discord,
				name: "Add Discord Role",
				description: "Add a role to a Discord member",
				data: ["guildId", "discordUserId", "roleId"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordDeleteMessage,
				serviceId: ServicesId.discord,
				name: "Delete Discord Message",
				description: "Delete a message from a Discord channel",
				data: ["channelId", "messageId"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordEditMessage,
				serviceId: ServicesId.discord,
				name: "Edit Discord Message",
				description: "Edit an existing Discord message",
				data: ["channelId", "messageId", "newContent"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordAddReaction,
				serviceId: ServicesId.discord,
				name: "Add Discord Reaction",
				description: "Add an emoji reaction to a Discord message",
				data: ["channelId", "messageId", "emoji"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordKickMember,
				serviceId: ServicesId.discord,
				name: "Kick Discord Member",
				description: "Kick a member from a Discord server",
				data: ["guildId", "discordUserId", "reason"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordBanMember,
				serviceId: ServicesId.discord,
				name: "Ban Discord Member",
				description: "Ban a member from a Discord server",
				data: ["guildId", "discordUserId", "reason", "deleteMessageDays"]
			}
		});

		await prisma.reactions.create({
			data: {
				id: ReactionsId.discordCreateRole,
				serviceId: ServicesId.discord,
				name: "Create Discord Role",
				description: "Create a new role in a Discord server",
				data: ["guildId", "roleName", "colorHex", "permissions"]
			}
		});

		console.log("✅ Reactions créées");

		console.log("🎉 Database setup completed!");

	} catch (error) {
		console.error("❌ Erreur setup DB:", error);
		throw error;
	}
}

main();

process.on("SIGINT", async () => {
	console.error("SIGINT received");
	await prisma.$disconnect();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	console.error("SIGTERM received");
	await prisma.$disconnect();
	process.exit(0);
});

process.on("uncaughtException", async (err) => {
	console.error("Uncaught Exception:", err);
	await prisma.$disconnect();
	process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
	console.error("Unhandled Rejection:", reason);
	await prisma.$disconnect();
	process.exit(1);
});