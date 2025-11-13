import { FastifyInstance } from "fastify";
import prisma from "../prismaClient";
import { reactionsList } from "../reactions/registry";

export default async function githubWebhookController(app: FastifyInstance) {
	app.post("/:id", async (req, reply) => {
		try {
			const workflowId = Number((req.params as any).id);
			const payload = req.body;
			const event = req.headers['x-github-event'] as string;

			console.log(`GitHub webhook received: ${event}`, payload);

			await prisma.log.create({
				data: {
					level: "info",
					message: `GitHub webhook received: ${event}`,
					context: "GitHub Webhook",
					metadata: { event, payload } as any,
				},
			});

			const workflow = await prisma.workflows.findUnique({
				where: {
					id: workflowId
				},
				include: {
					reaction: {
						select: {
							id: true,
							data: true
						}
					}
				}
			});
			if (!workflow) {
				return reply.status(404).send({ error: "workflow not found" });
			}

			reactionsList[workflow.reaction.id](workflow.userId, workflow.reactionData);

			return reply.status(200).send({ success: true });
		} catch (error: any) {
			console.error("GitHub webhook error:", error);
			return reply.status(500).send({ error: error.message });
		}
	});
}
