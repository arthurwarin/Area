import { FastifyInstance } from "fastify";
import prisma from "../prismaClient";
import { workflowService } from "../services/workflowService";
import { AuthRequest } from "../middlewares/authMiddleware";

async function workflowController(fastify: FastifyInstance) {

	fastify.post("/", async (request: AuthRequest, reply) => {
		try {
			const userId = request.user?.id || 1;
			if (userId === undefined) {
				throw new Error("userId not found");
			}
			const body = request.body as { name: string, description?: string, action: { id: number, data: string[] }, reaction: { id: number, data: string[] } };

			const newWorkflow = await workflowService.create(userId, body.action, body.reaction, body.name, body.description);

			await prisma.log.create({
				data: {
					level: "info",
					message: "Workflow created by " + (request.user?.id ?? request.ip),
					context: "POST /workflow",
					metadata: JSON.stringify(newWorkflow),
				}
			});
			return reply.status(200).send({ message: "POST /workflow OK" });
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "POST /workflow",
				}
			});
			return reply.status(500).send({ error: "POST /workflow failed", context: "" + error });
		}
	});

	fastify.get("/", async (request: AuthRequest, reply) => {
		try {
			const userId = request.user?.id || 1;
			if (userId === undefined) {
				throw new Error("userId not found");
			}

			const workflows = await workflowService.findAll(userId);

			return reply.status(200).send(workflows);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "GET /workflow",
				}
			});
			return reply.status(500).send({ error: "GET /workflow failed", context: "" + error });
		}
	});

	fastify.get("/:id", async (request: AuthRequest, reply) => {
		try {
			const id = Number((request.params as any).id);

			const workflow = await workflowService.findById(id);

			return reply.status(200).send(workflow);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "GET /workflow/:id",
				}
			});
			return reply.status(500).send({ error: "GET /workflow/:id failed", context: "" + error });
		}
	});

	fastify.delete("/:id", async (request: AuthRequest, reply) => {
		try {
			const id = Number((request.params as any).id);

			await workflowService.delete(id);
			await prisma.log.create({
				data: {
					level: "info",
					message: "Workflow deleted by " + (request.user?.id ?? request.ip),
					context: "DELETE /workflow/:id",
				}
			});
			return reply.status(204).send();
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "DELETE /workflow/:id",
				}
			});
			return reply.status(500).send({ error: "DELETE /workflow/:id failed", context: "" + error });
		}
	});

}

export default workflowController;
