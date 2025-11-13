import prisma from "../prismaClient";
import { createWebhook, deleteWebhook } from "../webhook/registry";

export const workflowService = {
	create: async (userId: number, action: { id: number, data: string[] }, reaction: { id: number, data: string[] }, name: string, description?: string) => {
		const workflow = await prisma.workflows.create({
			data: {
				userId,
				name,
				description,
				actionId: action.id,
				actionData: action.data,
				reactionId: reaction.id,
				reactionData: reaction.data,
			}
		});
		try {
			await createWebhook[action.id](workflow.id, action.data);
		} catch (e) {
			await deleteWebhook[action.id](workflow.id, action.data).catch(() => {});
			await prisma.workflows.delete({ where: { id: workflow.id } });
			const errorMessage = e instanceof Error ? e.message : String(e);
			throw new Error(`Failed to create webhook for action ${action.id}: ${errorMessage}`);
		}
		return workflow;
	},

	findAll: async (userId: number) => {
		return prisma.workflows.findMany({ where: { userId } });
	},

	findById: async (id: number) => {
		return prisma.workflows.findUnique({ where: { id } });
	},

	delete: async (id: number) => {
		const workflow = await prisma.workflows.findUnique({ where: { id } });
		if (!workflow) {
			throw new Error("workflow not found")
		}
		
		if (!deleteWebhook[workflow.actionId]) {
			throw new Error(`No deleteWebhook handler found for actionId ${workflow.actionId}`);
		}
		
		await deleteWebhook[workflow.actionId](workflow.id, workflow.actionData);
		await prisma.workflows.delete({ where: { id } });
	},
};
