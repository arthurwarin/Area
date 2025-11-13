import { FastifyInstance } from "fastify";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";
import prisma from "../prismaClient";
import { ServicesId } from "../../../shared/prisma/workflowData";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_API = 'https://discord.com/api/v10';

export default async function discordController(app: FastifyInstance) {
    
    app.get("/guilds", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        try {
            // Récupérer le token Discord OAuth de l'user
            const userId = req.user.userId || req.user.id;
            const userService = await prisma.userService.findFirst({
                where: {
                    userId: userId,
                    serviceId: ServicesId.discord
                }
            });

            if (!userService?.token) {
                return reply.status(404).send({ error: "Discord not connected" });
            }

            const guildsRes = await fetch(`${DISCORD_API}/users/@me/guilds`, {
                headers: {
                    'Authorization': `Bearer ${userService.token}`
                }
            });

            if (!guildsRes.ok) {
                throw new Error("Failed to get user guilds");
            }

            const guilds = await guildsRes.json();

            const manageableGuilds = guilds.filter((guild: any) => {
                if (guild.owner) return true;
                
                const permissions = BigInt(guild.permissions);
                const ADMINISTRATOR = BigInt(0x8);
                const MANAGE_GUILD = BigInt(0x20);
                
                return (permissions & ADMINISTRATOR) === ADMINISTRATOR ||
                       (permissions & MANAGE_GUILD) === MANAGE_GUILD;
            });

            const guildsWithBotStatus = await Promise.all(
                manageableGuilds.map(async (guild: any) => {
                    try {
                        const botRes = await fetch(
                            `${DISCORD_API}/guilds/${guild.id}/members/${DISCORD_CLIENT_ID}`,
                            {
                                headers: {
                                    'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
                                }
                            }
                        );
                        
                        return {
                            id: guild.id,
                            name: guild.name,
                            icon: guild.icon,
                            botPresent: botRes.ok,
                            isOwner: guild.owner
                        };
                    } catch (error) {
                        return {
                            id: guild.id,
                            name: guild.name,
                            icon: guild.icon,
                            botPresent: false,
                            isOwner: guild.owner
                        };
                    }
                })
            );

            return reply.send({ guilds: guildsWithBotStatus });
        } catch (error: any) {
            console.error("Error fetching Discord guilds:", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    app.get("/guilds/:guildId/channels", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { guildId } = req.params as { guildId: string };

        try {
            const channelsRes = await fetch(
                `${DISCORD_API}/guilds/${guildId}/channels`,
                {
                    headers: {
                        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
                    }
                }
            );

            if (!channelsRes.ok) {
                return reply.status(403).send({ 
                    error: "Bot not in this server",
                    inviteUrl: `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot&guild_id=${guildId}&disable_guild_select=true`
                });
            }

            const channels = await channelsRes.json();
            
            const textChannels = channels
                .filter((c: any) => c.type === 0)
                .sort((a: any, b: any) => a.position - b.position);

            return reply.send({ channels: textChannels });
        } catch (error: any) {
            console.error("Error fetching Discord channels:", error);
            return reply.status(500).send({ error: error.message });
        }
    });

    app.get("/bot-invite/:guildId?", async (req, reply) => {
        const { guildId } = req.params as { guildId?: string };
        
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            permissions: '8',
            scope: 'bot'
        });

        if (guildId) {
            params.append('guild_id', guildId);
            params.append('disable_guild_select', 'true');
        }

        return reply.send({ 
            url: `https://discord.com/api/oauth2/authorize?${params.toString()}`
        });
    });
}