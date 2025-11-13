import prisma from "../prismaClient";
import { ServicesId, ActionsId } from "../../../shared/prisma/workflowData"
import { createWebhook, deleteWebhook } from "./registry";

createWebhook[ActionsId.githubPush] = (async (workflowId: number, data: string[]) => {
	console.log("createWebhook GithubPush for workflow: {}, with data: {}", workflowId, data);
	if (data.length != 2) {
		throw new Error("data isn't valid");
	}
	const workflow = await prisma.workflows.findUnique({
		where: {
			id: workflowId
		},
		include: {
			user: {
				include: {
					userService: true
				}
			}
		}
	});
	if (!workflow?.user?.userService) {
		throw new Error("workflow/user not valid");
	}

	const userService = workflow.user.userService.find(x => x.serviceId === ServicesId.github);
	if (!userService) {
		throw new Error("user isn't login with github");
	}

	const res = await fetch(`https://api.github.com/repos/${data[0]}/${data[1]}/hooks`, {
		method: "POST",
		headers: {
			Authorization: `token ${userService.token}`,
			Accept: "application/vnd.github+json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: "web",
			active: true,
			events: ["push"],
			config: {
				url: `${process.env.WORKFLOW_URL}/webhook/github/${workflow.id}`,
				content_type: "json",
				insecure_ssl: "0",
			},
		}),
	});

	const body = await res.json();
	if (!res.ok) {
		throw new Error(JSON.stringify(body))
	}
});

deleteWebhook[ActionsId.githubPush] = (async (workflowId: number, data: string[]) => {
	console.log("deleteWebhook GithubPush for workflow: {}, with data: {}", workflowId, data);
	if (data.length != 2) {
		throw new Error("data isn't valid");
	}
	const workflow = await prisma.workflows.findUnique({
		where: {
			id: workflowId
		},
		include: {
			user: {
				include: {
					userService: true
				}
			}
		}
	});
	if (!workflow?.user?.userService) {
		throw new Error("workflow/user not valid");
	}

	const userService = workflow.user.userService.find(x => x.serviceId === ServicesId.github);
	if (!userService) {
		throw new Error("user isn't login with github");
	}

	const resHook = await fetch(`https://api.github.com/repos/${data[0]}/${data[1]}/hooks`, {
		method: "GET",
		headers: {
			Authorization: `token ${userService.token}`,
			Accept: "application/vnd.github+json",
		},
	});
	const bodyHook = await resHook.json();
	if (!resHook.ok) {
		// If the repository doesn't exist or we don't have access anymore, just log and continue
		// The workflow can still be deleted from our database
		if (resHook.status === 404 || resHook.status === 403) {
			console.log(`GitHub repository not found or no access (${resHook.status}), skipping webhook deletion for workflow ${workflowId}`);
			return;
		}
		throw new Error(`bodyHook: ${JSON.stringify(bodyHook)}`);
	}

	const desiredUrl = `${process.env.WORKFLOW_URL}/webhook/github/${workflow.id}`;
	const hookFound = bodyHook.find((h: any) => h.config && h.config.url === desiredUrl);

	if (!hookFound) {
		// Hook doesn't exist on GitHub anymore, that's fine
		console.log(`GitHub webhook not found for workflow ${workflowId}, it may have been deleted manually`);
		return;
	}


	const res = await fetch(`https://api.github.com/repos/${data[0]}/${data[1]}/hooks/${hookFound.id}`, {
		method: "DELETE",
		headers: {
			Authorization: `token ${userService.token}`,
			Accept: "application/vnd.github+json",
		},
	});
	
	if (!res.ok) {
		// If deletion fails with 404, the hook was already deleted
		if (res.status === 404) {
			console.log(`GitHub webhook already deleted for workflow ${workflowId}`);
			return;
		}
		const body = await res.json();
		throw new Error(`body: ${JSON.stringify(body)}`);
	}
});
