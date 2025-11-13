import Fastify, { FastifyReply, FastifyRequest } from "fastify";

import authController from "./controllers/authController";

const fastify = Fastify({ logger: true });

// Configuration CORS
fastify.register(require('@fastify/cors'), {
    origin: ['http://localhost:8081', 'http://localhost:3000'], // Frontend URLs
    credentials: true
});

fastify.register(authController, { prefix: "/" });

fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
  	return "AUTH is running...";
});

const start = async () => {
    try {
		await fastify.listen({ port: Number(process.env.PORT!), host: "0.0.0.0"  });
		console.log(`Server launch at http://localhost:${process.env.PORT!}`);
    } catch (err) {
		fastify.log.error(err);
		process.exit(1);
    }
};

start();
