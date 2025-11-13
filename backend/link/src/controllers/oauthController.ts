import { FastifyInstance } from "fastify";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";
import * as oauthService from "../services/oauthService";

export default async function oauthController(app: FastifyInstance) {
    // Discord OAuth flow
    app.get("/discord", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { mobile } = req.query as { mobile?: string };
        const isMobile = mobile === 'true';
        const authUrl = oauthService.getDiscordAuthUrl(req.user.id, isMobile);
        return reply.status(200).send({ url: authUrl });
    });

    app.get("/discord/callback", async (req, reply) => {
        const { code, state, mobile } = req.query as { code?: string; state?: string; mobile?: string };

        console.log("Discord callback received:", { code: !!code, state, mobile, fullQuery: req.query });

        if (!code || !state) {
            return reply.status(400).send({ error: "Missing code or state" });
        }

        try {
            // State contains userId (you should encode/sign this in production)
            const userId = parseInt(state);
            const result = await oauthService.handleDiscordCallback(code, userId);
            
            console.log("Discord OAuth success, mobile flag:", mobile);
            
            // Check if request is from mobile app
            if (mobile === 'true') {
                console.log("Redirecting to mobile app: area://user?success=discord");
                return reply.redirect(`area://user?success=discord`);
            }
            
            console.log("Redirecting to web frontend");
            // Redirect to web frontend with success
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?success=discord`);
        } catch (error: any) {
            console.error("Discord OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=discord`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=discord`);
        }
    });

    // GitHub OAuth flow
    app.get("/github", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { mobile } = req.query as { mobile?: string };
        const isMobile = mobile === 'true';
        const authUrl = oauthService.getGithubAuthUrl(req.user.id, isMobile);
        return reply.status(200).send({ url: authUrl });
    });

    app.get("/github/callback", async (req, reply) => {
        const { code, state, mobile } = req.query as { code?: string; state?: string; mobile?: string };

        console.log("GitHub callback received:", { code: !!code, state, mobile, fullQuery: req.query });

        if (!code || !state) {
            return reply.status(400).send({ error: "Missing code or state" });
        }

        try {
            const userId = parseInt(state);
            const result = await oauthService.handleGithubCallback(code, userId);
            
            console.log("GitHub OAuth success, mobile flag:", mobile);
            
            // Check if request is from mobile app
            if (mobile === 'true') {
                console.log("Redirecting to mobile app: area://user?success=github");
                return reply.redirect(`area://user?success=github`);
            }
            
            console.log("Redirecting to web frontend");
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?success=github`);
        } catch (error: any) {
            console.error("GitHub OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=github`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=github`);
        }
    });

    // Reddit OAuth flow
    app.get("/reddit", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { mobile } = req.query as { mobile?: string };
        const isMobile = mobile === 'true';
        const authUrl = oauthService.getRedditAuthUrl(req.user.id, isMobile);
        return reply.status(200).send({ url: authUrl });
    });

    app.get("/reddit/callback", async (req, reply) => {
        const { code, state, error, mobile } = req.query as { code?: string; state?: string; error?: string; mobile?: string };

        console.log("Reddit callback received:", { code: !!code, state, error, mobile, fullQuery: req.query });

        if (error) {
            console.error("Reddit OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=reddit`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=reddit`);
        }

        if (!code || !state) {
            return reply.status(400).send({ error: "Missing code or state" });
        }

        try {
            const userId = parseInt(state);
            const result = await oauthService.handleRedditCallback(code, userId);
            
            console.log("Reddit OAuth success, mobile flag:", mobile);
            
            // Check if request is from mobile app
            if (mobile === 'true') {
                console.log("Redirecting to mobile app: area://user?success=reddit");
                return reply.redirect(`area://user?success=reddit`);
            }
            
            console.log("Redirecting to web frontend");
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?success=reddit`);
        } catch (error: any) {
            console.error("Reddit OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=reddit`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=reddit`);
        }
    });

    // Spotify OAuth flow
    app.get("/spotify", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { mobile } = req.query as { mobile?: string };
        const isMobile = mobile === 'true';
        const authUrl = oauthService.getSpotifyAuthUrl(req.user.id, isMobile);
        return reply.status(200).send({ url: authUrl });
    });

    app.get("/spotify/callback", async (req, reply) => {
        const { code, state, error, mobile } = req.query as { code?: string; state?: string; error?: string; mobile?: string };

        console.log("Spotify callback received:", { code: !!code, state, error, mobile, fullQuery: req.query });

        if (error) {
            console.error("Spotify OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=spotify`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=spotify`);
        }

        if (!code || !state) {
            return reply.status(400).send({ error: "Missing code or state" });
        }

        try {
            const userId = parseInt(state);
            const result = await oauthService.handleSpotifyCallback(code, userId);
            
            console.log("Spotify OAuth success, mobile flag:", mobile);
            
            // Check if request is from mobile app
            if (mobile === 'true') {
                console.log("Redirecting to mobile app: area://user?success=spotify");
                return reply.redirect(`area://user?success=spotify`);
            }
            
            console.log("Redirecting to web frontend");
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?success=spotify`);
        } catch (error: any) {
            console.error("Spotify OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=spotify`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=spotify`);
        }
    });

    // Slack OAuth flow
    app.get("/slack", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { mobile } = req.query as { mobile?: string };
        const isMobile = mobile === 'true';
        const authUrl = oauthService.getSlackAuthUrl(req.user.id, isMobile);
        return reply.status(200).send({ url: authUrl });
    });

    app.get("/slack/callback", async (req, reply) => {
        const { code, state, error, mobile } = req.query as { code?: string; state?: string; error?: string; mobile?: string };

        console.log("Slack callback received:", { code: !!code, state, error, mobile, fullQuery: req.query });

        if (error) {
            console.error("Slack OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=slack`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=slack`);
        }

        if (!code || !state) {
            return reply.status(400).send({ error: "Missing code or state" });
        }

        try {
            const userId = parseInt(state);
            const result = await oauthService.handleSlackCallback(code, userId);
            
            console.log("Slack OAuth success, mobile flag:", mobile);
            
            // Check if request is from mobile app
            if (mobile === 'true') {
                console.log("Redirecting to mobile app: area://user?success=slack");
                return reply.redirect(`area://user?success=slack`);
            }
            
            console.log("Redirecting to web frontend");
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?success=slack`);
        } catch (error: any) {
            console.error("Slack OAuth error:", error);
            
            if (mobile === 'true') {
                return reply.redirect(`area://user?error=slack`);
            }
            
            return reply.redirect(`${process.env.REDIRECT_URL}/integrations?error=slack`);
        }
    });
}

