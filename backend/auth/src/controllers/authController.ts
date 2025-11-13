import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authService } from "../services/authService";
import prisma from "../prismaClient";

async function authController(fastify: FastifyInstance) {
	fastify.post("/signup", async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
		try {
			await authService.signup(request.body);
			reply.status(200).send();
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "POST /signup/",
				},
			});
			reply.status(500).send({ error: "POST /signup/ failed", content: "" + error });
		}
	});

	fastify.post("/login", async (request: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
		try {
			const token = await authService.login(request.body);
			reply.status(201).send({ token });
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "POST /login/",
				},
			});
			reply.status(500).send({ error: "POST /login/ failed", content: "" + error });
		}
	});

	fastify.post("/microsoft/auth", async (
		request: FastifyRequest<{ 
			Body: { 
				microsoftToken: string; 
				email: string; 
				displayName: string; 
				microsoftId: string 
			} 
		}>, 
		reply: FastifyReply
	) => {
		try {
			const result = await authService.microsoftAuth(request.body);
			reply.status(200).send(result);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "POST /microsoft/auth",
				},
			});
			reply.status(500).send({ error: "Microsoft authentication failed", message: "" + error });
		}
	});
}

export default authController;
