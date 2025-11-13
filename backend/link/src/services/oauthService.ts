import prisma from "../prismaClient";
import { ServicesId, ActionsId } from "../../../shared/prisma/workflowData"

interface DiscordTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    email?: string;
}

interface GitHubTokenResponse {
    access_token: string;
    refresh_token?: string;
    token_type: string;
    scope: string;
    error?: string;
    error_description?: string;
}

interface GitHubUser {
    id: number;
    login: string;
    email?: string;
}

interface RedditTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface RedditUser {
    id: string;
    name: string;
    icon_img: string;
}

interface SpotifyTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface SpotifyUser {
    id: string;
    display_name: string;
    email: string;
    images?: Array<{ url: string }>;
}

interface SlackTokenResponse {
    ok: boolean;
    access_token: string;
    token_type: string;
    scope: string;
    bot_user_id?: string;
    app_id: string;
    team: {
        id: string;
        name: string;
    };
    authed_user: {
        id: string;
        scope: string;
        access_token: string;
        token_type: string;
    };
}

interface SlackUser {
    ok: boolean;
    user: {
        id: string;
        team_id: string;
        name: string;
        real_name?: string;
        profile: {
            email?: string;
            image_72?: string;
        };
    };
}

export function getDiscordAuthUrl(userId?: number, isMobile?: boolean): string {
    const baseUrl = process.env.BASE_URL!.replace(/\/$/, '');
    const redirectUri = `${baseUrl}/oauth/discord/callback${isMobile ? '?mobile=true' : ''}`;
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "identify email guilds",
        state: userId?.toString() || "temp",
    });

    return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function handleDiscordCallback(code: string, userId: number) {
    const baseUrl = process.env.BASE_URL!.replace(/\/$/, '');
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: `${baseUrl}/oauth/discord/callback`,
        }),
    });

    if (!tokenResponse.ok) {
        throw new Error("Failed to exchange Discord code for token");
    }

    const tokenData = await tokenResponse.json() as DiscordTokenResponse;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    });

    if (!userResponse.ok) {
        throw new Error("Failed to get Discord user info");
    }

    const discordUser = await userResponse.json() as DiscordUser;

    const existingConnection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: ServicesId.discord,
        },
    });

    let userService;
    if (existingConnection) {
        userService = await prisma.userService.update({
            where: { id: existingConnection.id },
            data: {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                updatedAt: new Date(),
            },
        });
    } else {
        userService = await prisma.userService.create({
            data: {
                userId: userId,
                serviceId: ServicesId.discord,
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
            },
        });
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `User ${userId} connected Discord account`,
            context: "Discord OAuth",
            metadata: { discordId: discordUser.id, username: discordUser.username },
        },
    });

    return { success: true, service: "discord", username: discordUser.username };
}

export function getGithubAuthUrl(userId: number, isMobile?: boolean): string {
    const baseUrl = process.env.BASE_URL!.replace(/\/$/, '');
    const redirectUri = `${baseUrl}/oauth/github/callback${isMobile ? '?mobile=true' : ''}`;
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: redirectUri,
        scope: "user repo",
        state: userId.toString(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function handleGithubCallback(code: string, userId: number) {
    const baseUrl = process.env.BASE_URL!.replace(/\/$/, '');

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID!,
            client_secret: process.env.GITHUB_CLIENT_SECRET!,
            code: code,
            redirect_uri: `${baseUrl}/oauth/github/callback`,
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("GitHub token exchange error:", tokenResponse.status, errorText);
        throw new Error(`Failed to exchange GitHub code for token: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json() as GitHubTokenResponse;

    if (tokenData.error) {
        console.error("GitHub OAuth error in response:", tokenData);
        throw new Error(`GitHub OAuth error: ${tokenData.error_description}`);
    }

    const userResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: "application/vnd.github.v3+json",
        },
    });

    if (!userResponse.ok) {
        throw new Error("Failed to get GitHub user info");
    }

    const githubUser = await userResponse.json() as GitHubUser;

    const existingConnection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: ServicesId.github,
        },
    });

    let userService;
    if (existingConnection) {
        userService = await prisma.userService.update({
            where: { id: existingConnection.id },
            data: {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token || null,
                updatedAt: new Date(),
            },
        });
    } else {
        userService = await prisma.userService.create({
            data: {
                userId: userId,
                serviceId: ServicesId.github,
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token || null,
            },
        });
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `User ${userId} connected GitHub account`,
            context: "GitHub OAuth",
            metadata: { githubId: githubUser.id, username: githubUser.login },
        },
    });

    return { success: true, service: "github", username: githubUser.login };
}

export function getRedditAuthUrl(userId: number, isMobile?: boolean): string {
    const baseUrl = process.env.BASE_URL!.replace(/\/$/, ''); // Remove trailing slash
    const redirectUri = `${baseUrl}/oauth/reddit/callback${isMobile ? '?mobile=true' : ''}`;
    const params = new URLSearchParams({
        client_id: process.env.REDDIT_CLIENT_ID!,
        response_type: "code",
        state: userId.toString(),
        redirect_uri: `${process.env.BASE_URL}/oauth/reddit/callback`,
        duration: "permanent",
        scope: "identity read submit subscribe vote history",
    });

    return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
}

export async function handleRedditCallback(code: string, userId: number) {
    const auth = Buffer.from(
        `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${auth}`,
            "User-Agent": "Area-App/1.0.0",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: `${process.env.BASE_URL}/oauth/reddit/callback`,
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Reddit token exchange error:", tokenResponse.status, errorText);
        throw new Error(`Failed to exchange Reddit code for token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as RedditTokenResponse;

    const userResponse = await fetch("https://oauth.reddit.com/api/v1/me", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "User-Agent": "Area-App/1.0.0",
        },
    });

    if (!userResponse.ok) {
        throw new Error("Failed to get Reddit user info");
    }

    const redditUser = await userResponse.json() as RedditUser;

    const existingConnection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: ServicesId.reddit
        },
    });

    let userService;
    if (existingConnection) {
        userService = await prisma.userService.update({
            where: { id: existingConnection.id },
            data: {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                updatedAt: new Date(),
            },
        });
    } else {
        userService = await prisma.userService.create({
            data: {
                userId: userId,
                serviceId: ServicesId.reddit,
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
            },
        });
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `User ${userId} connected Reddit account`,
            context: "Reddit OAuth",
            metadata: { redditId: redditUser.id, username: redditUser.name },
        },
    });

    return { success: true, service: "reddit", username: redditUser.name };
}

export function getSpotifyAuthUrl(userId: number, isMobile?: boolean): string {
    const baseUrl = process.env.BASE_URL!.replace(/\/$/, '').replace('localhost', '127.0.0.1');
    const redirectUri = `${baseUrl}/oauth/spotify/callback${isMobile ? '?mobile=true' : ''}`;

    const params = new URLSearchParams({
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        response_type: "code",
        redirect_uri: redirectUri,
        state: userId.toString(),
        scope: "user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private user-library-read user-library-modify user-top-read user-read-recently-played",
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleSpotifyCallback(code: string, userId: number) {
    const baseUrl = process.env.BASE_URL!.replace('localhost', '127.0.0.1');

    const auth = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${auth}`,
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: `${baseUrl}/oauth/spotify/callback`,
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Spotify token exchange error:", tokenResponse.status, errorText);
        throw new Error(`Failed to exchange Spotify code for token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as SpotifyTokenResponse;

    const userResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    });

    if (!userResponse.ok) {
        throw new Error("Failed to get Spotify user info");
    }

    const spotifyUser = await userResponse.json() as SpotifyUser;

    const existingConnection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: ServicesId.spotify,
        },
    });

    let userService;
    if (existingConnection) {
        userService = await prisma.userService.update({
            where: { id: existingConnection.id },
            data: {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                updatedAt: new Date(),
            },
        });
    } else {
        userService = await prisma.userService.create({
            data: {
                userId: userId,
                serviceId: ServicesId.spotify,
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
            },
        });
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `User ${userId} connected Spotify account`,
            context: "Spotify OAuth",
            metadata: { spotifyId: spotifyUser.id, displayName: spotifyUser.display_name },
        },
    });

    return { success: true, service: "spotify", username: spotifyUser.display_name };
}

export function getSlackAuthUrl(userId: number, isMobile?: boolean): string {
    const baseUrl = (process.env.SLACK_BASE_URL || process.env.BASE_URL)!.replace(/\/$/, '');
    const redirectUri = `${baseUrl}/oauth/slack/callback${isMobile ? '?mobile=true' : ''}`;

    const params = new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        scope: "channels:read,channels:history,chat:write,users:read,users:read.email",
        user_scope: "channels:read,channels:history,chat:write,users:read,users:read.email",
        redirect_uri: redirectUri,
        state: userId.toString(),
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function handleSlackCallback(code: string, userId: number) {
    const baseUrl = process.env.SLACK_BASE_URL || process.env.BASE_URL;

    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.SLACK_CLIENT_ID!,
            client_secret: process.env.SLACK_CLIENT_SECRET!,
            code: code,
            redirect_uri: `${baseUrl}/oauth/slack/callback`,
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Slack token exchange error:", tokenResponse.status, errorText);
        throw new Error(`Failed to exchange Slack code for token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as SlackTokenResponse;

    if (!tokenData.ok) {
        console.error("Slack OAuth error:", tokenData);
        throw new Error(`Slack OAuth failed: ${JSON.stringify(tokenData)}`);
    }

    console.log("Slack token data received:", {
        teamId: tokenData.team.id,
        teamName: tokenData.team.name,
        userId: tokenData.authed_user.id,
        hasAccessToken: !!tokenData.authed_user.access_token
    });


    const slackUserId = tokenData.authed_user.id;
    const slackTeamId = tokenData.team.id;
    const slackTeamName = tokenData.team.name;

    const existingConnection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: ServicesId.slack,
        },
    });

    let userService;
    if (existingConnection) {
        userService = await prisma.userService.update({
            where: { id: existingConnection.id },
            data: {
                token: tokenData.authed_user.access_token,
                refreshToken: null,
                updatedAt: new Date(),
            },
        });
    } else {
        userService = await prisma.userService.create({
            data: {
                userId: userId,
                serviceId: ServicesId.slack,
                token: tokenData.authed_user.access_token,
                refreshToken: null,
            },
        });
    }

    await prisma.log.create({
        data: {
            level: "info",
            message: `User ${userId} connected Slack account`,
            context: "Slack OAuth",
            metadata: {
                slackId: slackUserId,
                teamId: slackTeamId,
                teamName: slackTeamName
            },
        },
    });

    return { success: true, service: "slack", username: slackUserId };
}

export default {
    getDiscordAuthUrl,
    handleDiscordCallback,
    getGithubAuthUrl,
    handleGithubCallback,
    getRedditAuthUrl,
    handleRedditCallback,
    getSpotifyAuthUrl,
    handleSpotifyCallback,
    getSlackAuthUrl,
    handleSlackCallback,
};