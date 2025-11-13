import prisma from "../prismaClient";
import { ServicesId, ReactionsId } from "../../../shared/prisma/workflowData";
import { reactionsList } from "./registry";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const DISCORD_API = 'https://discord.com/api/v10';

// Envoyer un message dans un channel
reactionsList[ReactionsId.discordMessage] = async (userId: number, data: string[]) => {
    console.log("Reaction discordMessage for user: {}, with data: {}", userId, data);
    
    if (data.length < 2) {
        throw new Error("data isn't valid - need channelId and message");
    }

    const [channelId, message] = data;

    const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: message
        })
    });

    const body = await res.json();
    if (!res.ok) {
        throw new Error(JSON.stringify(body));
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord message sent to channel ${channelId}`,
            context: "Discord Reaction",
            metadata: { channelId, message } as any,
        },
    });
};

// Envoyer un DM à un utilisateur
reactionsList[ReactionsId.discordDM] = async (userId: number, data: string[]) => {
    console.log("Reaction discordDM for user: {}, with data: {}", userId, data);
    
    if (data.length < 2) {
        throw new Error("data isn't valid - need discordUserId and message");
    }

    const [discordUserId, message] = data;

    // 1. Créer le DM channel
    const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
        method: "POST",
        headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recipient_id: discordUserId
        })
    });

    if (!dmRes.ok) {
        const dmBody = await dmRes.json();
        throw new Error(JSON.stringify(dmBody));
    }

    const dmChannel = await dmRes.json();

    // 2. Envoyer le message
    const msgRes = await fetch(`${DISCORD_API}/channels/${dmChannel.id}/messages`, {
        method: "POST",
        headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: message
        })
    });

    const body = await msgRes.json();
    if (!msgRes.ok) {
        throw new Error(JSON.stringify(body));
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord DM sent to user ${discordUserId}`,
            context: "Discord Reaction",
            metadata: { discordUserId, message } as any,
        },
    });
};

// Créer un channel
reactionsList[ReactionsId.discordCreateChannel] = async (userId: number, data: string[]) => {
    console.log("Reaction discordCreateChannel for user: {}, with data: {}", userId, data);
    
    if (data.length < 2) {
        throw new Error("data isn't valid - need guildId and channelName");
    }

    const [guildId, channelName, channelType = "0"] = data;

    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, {
        method: "POST",
        headers: {
            'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: channelName,
            type: parseInt(channelType)
        })
    });

    const body = await res.json();
    if (!res.ok) {
        throw new Error(JSON.stringify(body));
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord channel "${channelName}" created in guild ${guildId}`,
            context: "Discord Reaction",
            metadata: { guildId, channelName, channelId: body.id } as any,
        },
    });
};

// Ajouter un role à un membre
reactionsList[ReactionsId.discordAddRole] = async (userId: number, data: string[]) => {
    console.log("Reaction discordAddRole for user: {}, with data: {}", userId, data);
    
    if (data.length < 3) {
        throw new Error("data isn't valid - need guildId, discordUserId and roleId");
    }

    const [guildId, discordUserId, roleId] = data;

    const res = await fetch(
        `${DISCORD_API}/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
        {
            method: "PUT",
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        }
    );

    if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord role added to user in guild ${guildId}`,
            context: "Discord Reaction",
            metadata: { guildId, discordUserId, roleId } as any,
        },
    });
};

// Supprimer un message
reactionsList[ReactionsId.discordDeleteMessage] = async (userId: number, data: string[]) => {
    console.log("Reaction discordDeleteMessage for user: {}, with data: {}", userId, data);
    
    if (data.length < 2) {
        throw new Error("data isn't valid - need channelId and messageId");
    }

    const [channelId, messageId] = data;

    const res = await fetch(
        `${DISCORD_API}/channels/${channelId}/messages/${messageId}`,
        {
            method: "DELETE",
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        }
    );

    if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord message deleted in channel ${channelId}`,
            context: "Discord Reaction",
            metadata: { channelId, messageId } as any,
        },
    });
};

// Modifier un message
reactionsList[ReactionsId.discordEditMessage] = async (userId: number, data: string[]) => {
    console.log("Reaction discordEditMessage for user: {}, with data: {}", userId, data);
    
    if (data.length < 3) {
        throw new Error("data isn't valid - need channelId, messageId and newContent");
    }

    const [channelId, messageId, newContent] = data;

    const res = await fetch(
        `${DISCORD_API}/channels/${channelId}/messages/${messageId}`,
        {
            method: "PATCH",
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: newContent
            })
        }
    );

    const body = await res.json();
    if (!res.ok) {
        throw new Error(JSON.stringify(body));
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord message edited in channel ${channelId}`,
            context: "Discord Reaction",
            metadata: { channelId, messageId, newContent } as any,
        },
    });
};

// Ajouter une réaction emoji à un message
reactionsList[ReactionsId.discordAddReaction] = async (userId: number, data: string[]) => {
    console.log("Reaction discordAddReaction for user: {}, with data: {}", userId, data);
    
    if (data.length < 3) {
        throw new Error("data isn't valid - need channelId, messageId and emoji");
    }

    const [channelId, messageId, emoji] = data;
    
    // Encoder l'emoji pour l'URL
    const encodedEmoji = encodeURIComponent(emoji);

    const res = await fetch(
        `${DISCORD_API}/channels/${channelId}/messages/${messageId}/reactions/${encodedEmoji}/@me`,
        {
            method: "PUT",
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`
            }
        }
    );

    if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord reaction added to message in channel ${channelId}`,
            context: "Discord Reaction",
            metadata: { channelId, messageId, emoji } as any,
        },
    });
};

// Kick un membre du serveur
reactionsList[ReactionsId.discordKickMember] = async (userId: number, data: string[]) => {
    console.log("Reaction discordKickMember for user: {}, with data: {}", userId, data);
    
    if (data.length < 2) {
        throw new Error("data isn't valid - need guildId and discordUserId");
    }

    const [guildId, discordUserId, reason = "No reason provided"] = data;

    const res = await fetch(
        `${DISCORD_API}/guilds/${guildId}/members/${discordUserId}`,
        {
            method: "DELETE",
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'X-Audit-Log-Reason': reason
            }
        }
    );

    if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord member kicked from guild ${guildId}`,
            context: "Discord Reaction",
            metadata: { guildId, discordUserId, reason } as any,
        },
    });
};

// Ban un membre du serveur
reactionsList[ReactionsId.discordBanMember] = async (userId: number, data: string[]) => {
    console.log("Reaction discordBanMember for user: {}, with data: {}", userId, data);
    
    if (data.length < 2) {
        throw new Error("data isn't valid - need guildId and discordUserId");
    }

    const [guildId, discordUserId, reason = "No reason provided", deleteMessageDays = "0"] = data;

    const res = await fetch(
        `${DISCORD_API}/guilds/${guildId}/bans/${discordUserId}`,
        {
            method: "PUT",
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Audit-Log-Reason': reason
            },
            body: JSON.stringify({
                delete_message_days: parseInt(deleteMessageDays) // 0-7 jours
            })
        }
    );

    if (!res.ok) {
        const body = await res.text();
        throw new Error(body);
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord member banned from guild ${guildId}`,
            context: "Discord Reaction",
            metadata: { guildId, discordUserId, reason } as any,
        },
    });
};

// Créer un role
reactionsList[ReactionsId.discordCreateRole] = async (userId: number, data: string[]) => {
    console.log("Reaction discordCreateRole for user: {}, with data: {}", userId, data);
    
    if (data.length < 2) {
        throw new Error("data isn't valid - need guildId and roleName");
    }

    const [guildId, roleName, colorHex = "0", permissions = "0"] = data;

    // Convertir la couleur hex (ex: "FF0000") en nombre
    const colorInt = colorHex === "0" ? 0 : parseInt(colorHex, 16);

    const res = await fetch(
        `${DISCORD_API}/guilds/${guildId}/roles`,
        {
            method: "POST",
            headers: {
                'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: roleName,
                color: colorInt,
                permissions: permissions,
                hoist: false, // Afficher séparément dans la liste des membres
                mentionable: true
            })
        }
    );

    const body = await res.json();
    if (!res.ok) {
        throw new Error(JSON.stringify(body));
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `Discord role "${roleName}" created in guild ${guildId}`,
            context: "Discord Reaction",
            metadata: { guildId, roleName, roleId: body.id } as any,
        },
    });
};