export const createWebhook: Record<number, (workflowId: number, args: string[]) => Promise<void>> = {};
export const deleteWebhook: Record<number, (workflowId: number, args: string[]) => Promise<void>> = {};

import "./github"
import "./timer"
import "./spotify"
import "./reddit"
import "./slack"
