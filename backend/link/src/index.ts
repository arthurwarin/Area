import Fastify from "fastify";
import oauthController from "./controllers/oauthController";
import connectionController from "./controllers/connectionController";
import timerController from "./controllers/timerController";
import discordController from "./controllers/discordController";

const app = Fastify({ logger: true });

// Enable CORS for all routes
app.addHook('preHandler', async (request, reply) => {
    // Set CORS headers
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    reply.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        reply.status(200).send();
    }
});

app.register(oauthController, { prefix: "/oauth" });
app.register(connectionController, { prefix: "/connections" });
app.register(timerController, { prefix: "/timer" });
app.register(discordController, { prefix: "/discord" });

app.get("/", async () => {
    return "Integrations service is running...";
});

app.get("/health", async () => {
    return { status: "ok", service: "integrations" };
});

const start = async () => {
    try {
        await app.listen({ port: Number(process.env.PORT!), host: "0.0.0.0" });
        console.log(`Integrations service running at http://localhost:${process.env.PORT!}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
