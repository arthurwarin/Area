import Fastify from "fastify";
import githubWebhookController from "./controllers/githubWebhookController";
import { startTimerWorker } from "./workers/timerWorker";
import { startSpotifyWorker } from "./workers/spotifyWorker";
import { startRedditWorker } from "./workers/redditWorker";
import { startSlackWorker } from "./workers/slackWorker";

const app = Fastify({ logger: true });

app.register(githubWebhookController, { prefix: "/webhook/github" });

app.get("/", async () => {
	return "Workflow service is running...";
});

app.get("/health", async () => {
	return { status: "ok", service: "workflow" };
});

const start = async () => {
	try {
		await app.listen({ port: Number(process.env.PORT!), host: "0.0.0.0" });
		console.log(`Workflow service running at http://localhost:${process.env.PORT!}`);
		
		// Démarrer le Timer Worker
		startTimerWorker();
		
		// Démarrer le Spotify Worker
		startSpotifyWorker();
		
		// Démarrer le Reddit Worker
		startRedditWorker();
		
		// Démarrer le Slack Worker
		startSlackWorker();
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
