import prisma from "../prismaClient";
import { ActionsId } from "../../../shared/prisma/workflowData";
import { reactionsList } from "../reactions/registry";

/**
 * Timer Worker
 * 
 * Ce worker tourne toutes les minutes et vérifie si des workflows Timer doivent se déclencher.
 * Il scanne la DB pour trouver les workflows avec des actions Timer et vérifie leurs conditions.
 */

interface TimerWorkflow {
	id: number;
	userId: number;
	name: string;
	actionId: number;
	actionData: string[];
	reactionId: number;
	reactionData: string[];
}

/**
 * Vérifie si un workflow Timer Daily doit se déclencher
 * Format actionData: [timePattern] (ex: ["09:30"])
 */
function shouldTriggerDaily(actionData: string[], debug = false): boolean {
	if (actionData.length < 1) return false;

	const timePattern = actionData[0];
	const now = new Date();
	const currentHour = String(now.getHours()).padStart(2, '0');
	const currentMinute = String(now.getMinutes()).padStart(2, '0');
	const currentTime = `${currentHour}:${currentMinute}`;

	if (debug) {
		console.log(`  📍 Timer Daily - Current: ${currentTime}, Target: ${timePattern}, Match: ${currentTime === timePattern}`);
	}

	return currentTime === timePattern;
}

/**
 * Vérifie si un workflow Timer Date doit se déclencher
 * Format actionData: [datePattern] (ex: ["25/12"])
 * Déclenche à minuit le jour J
 */
function shouldTriggerDate(actionData: string[], debug = false): boolean {
	if (actionData.length < 1) return false;

	const datePattern = actionData[0];
	const now = new Date();
	const currentDay = String(now.getDate()).padStart(2, '0');
	const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
	const currentDate = `${currentDay}/${currentMonth}`;

	// Déclenche uniquement à minuit (00:00)
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();

	if (debug) {
		console.log(`  📅 Timer Date - Current: ${currentDate} ${currentHour}:${currentMinute}, Target: ${datePattern} 00:00, Match: ${currentDate === datePattern && currentHour === 0 && currentMinute === 0}`);
	}

	return currentDate === datePattern && currentHour === 0 && currentMinute === 0;
}

/**
 * Vérifie si un workflow Timer Future Date doit se déclencher
 * Format actionData: [daysAhead, creationDate] (ex: ["3", "2025-11-04T12:00:00Z"])
 */
function shouldTriggerFutureDate(actionData: string[], debug = false): boolean {
	if (actionData.length < 2) return false;

	const daysAhead = parseInt(actionData[0], 10);
	const createdAt = new Date(actionData[1]);

	if (isNaN(daysAhead) || isNaN(createdAt.getTime())) return false;

	// Calculer la date cible
	const targetDate = new Date(createdAt);
	targetDate.setDate(targetDate.getDate() + daysAhead);

	const now = new Date();

	if (debug) {
		console.log(`  ⏳ Timer Future - Created: ${createdAt.toISOString()}, +${daysAhead} days = ${targetDate.toISOString()}, Now: ${now.toISOString()}, Match: ${targetDate.getDate() === now.getDate() && targetDate.getMonth() === now.getMonth() && targetDate.getFullYear() === now.getFullYear()}`);
	}

	// Vérifier si on est le jour J (ignorer l'heure)
	return targetDate.getDate() === now.getDate() &&
		targetDate.getMonth() === now.getMonth() &&
		targetDate.getFullYear() === now.getFullYear();
}

/**
 * Vérifie si un workflow Timer doit se déclencher
 */
function shouldTrigger(workflow: TimerWorkflow, debug = false): boolean {
	switch (workflow.actionId) {
		case ActionsId.timerDaily:
			return shouldTriggerDaily(workflow.actionData, debug);
		
		case ActionsId.timerDate:
			return shouldTriggerDate(workflow.actionData, debug);
		
		case ActionsId.timerFutureDate:
			return shouldTriggerFutureDate(workflow.actionData, debug);
		
		default:
			return false;
	}
}

/**
 * Déclenche la reaction d'un workflow
 */
async function triggerReaction(workflow: TimerWorkflow): Promise<void> {
	try {
		console.log(`🔔 Triggering Timer workflow #${workflow.id}: ${workflow.name}`);
		
		// Exécuter la reaction
		await reactionsList[workflow.reactionId](workflow.userId, workflow.reactionData);
		
		console.log(`✅ Timer workflow #${workflow.id} executed successfully`);

		// Logger dans la DB
		await prisma.log.create({
			data: {
				level: "info",
				message: `Timer workflow "${workflow.name}" (ID: ${workflow.id}) triggered`,
				context: "Timer Worker",
				metadata: {
					workflowId: workflow.id,
					actionId: workflow.actionId,
					reactionId: workflow.reactionId
				} as any
			}
		});
	} catch (error: any) {
		console.error(`❌ Error executing Timer workflow #${workflow.id}:`, error);
		
		// Logger l'erreur
		await prisma.log.create({
			data: {
				level: "error",
				message: `Timer workflow "${workflow.name}" (ID: ${workflow.id}) failed: ${error.message}`,
				context: "Timer Worker",
				metadata: {
					workflowId: workflow.id,
					error: error.message
				} as any
			}
		});
	}
}

/**
 * Scanne tous les workflows Timer et déclenche ceux qui doivent l'être
 */
async function checkTimerWorkflows(): Promise<void> {
	try {
		// Récupérer tous les workflows avec des actions Timer
		const workflows = await prisma.workflows.findMany({
			where: {
				actionId: {
					in: [
						ActionsId.timerDaily,
						ActionsId.timerDate,
						ActionsId.timerFutureDate
					]
				}
			},
			include: {
				user: true,
				action: true,
				reaction: true
			}
		});

		if (workflows.length === 0) {
			return; // Pas de workflows Timer
		}

		console.log(`⏰ Checking ${workflows.length} Timer workflow(s)...`);

		// Pour chaque workflow, vérifier s'il doit se déclencher
		for (const workflow of workflows) {
			const timerWorkflow: TimerWorkflow = {
				id: workflow.id,
				userId: workflow.userId,
				name: workflow.name,
				actionId: workflow.actionId,
				actionData: workflow.actionData,
				reactionId: workflow.reactionId,
				reactionData: workflow.reactionData
			};

			console.log(`  🔍 Workflow #${workflow.id}: "${workflow.name}"`);
			if (shouldTrigger(timerWorkflow, true)) {
				await triggerReaction(timerWorkflow);
			}
		}
	} catch (error: any) {
		console.error("❌ Error in Timer Worker:", error);
		
		await prisma.log.create({
			data: {
				level: "error",
				message: `Timer Worker error: ${error.message}`,
				context: "Timer Worker"
			}
		});
	}
}

/**
 * Démarre le worker Timer
 * Vérifie toutes les minutes si des workflows doivent se déclencher
 */
export function startTimerWorker(): void {
	console.log("🚀 Starting Timer Worker...");
	console.log("⏰ Will check Timer workflows every minute");

	// Vérifier immédiatement au démarrage
	checkTimerWorkflows();

	// Puis vérifier toutes les minutes (60000ms)
	setInterval(() => {
		checkTimerWorkflows();
	}, 60000);
}
