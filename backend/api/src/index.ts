import Fastify from "fastify";

import userController from "./controllers/userController";
import workflowController from "./controllers/workflowController";
import serviceController from "./controllers/serviceController";
import prisma from "./prismaClient";

const app = Fastify({ logger: true });

// Configuration CORS
app.register(require('@fastify/cors'), {
	origin: ['http://localhost:8081', 'http://localhost:3000'], // Frontend URLs
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
});

app.register(userController, { prefix: "/user" });
app.register(workflowController, { prefix: "/workflow" });
app.register(serviceController, { prefix: "/services" });

app.get("/", async () => {
	return "API is running...";
});

app.get("/about.json", async (request, reply) => {
	const services = await prisma.services.findMany({
		select: {
			name: true,
			actions: {
				select: {
					name: true,
					description: true
				}
			}
		}
	});
	return reply.status(201).send({
		"client": {
			"host": request.ip
		},
		"server": {
			"current_time": Date.now(),
			"services": services,
		}
	})
});

const start = async () => {
	try {
		await app.listen({ port: Number(process.env.PORT!), host: "0.0.0.0" });
		console.log(`Server running at http://localhost:${process.env.PORT!}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};

start();
