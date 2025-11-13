import prisma from "../prismaClient";
import { ServicesId, ActionsId } from "../../../shared/prisma/workflowData";
import { createWebhook, deleteWebhook } from "./registry";

/**
 * Timer Actions
 * 
 * Les actions Timer ne créent pas de webhooks externes.
 * Elles stockent simplement la configuration dans actionData.
 * Un worker vérifiera périodiquement ces workflows et les déclenchera au bon moment.
 * 
 * Format des actionData pour chaque type:
 * 
 * 1. timerDaily (ActionsId.timerDaily = 2):
 *    - data[0]: heure au format HH:MM (ex: "09:30")
 *    - Déclenche tous les jours à cette heure
 * 
 * 2. timerDate (ActionsId.timerDate = 3):
 *    - data[0]: date au format DD/MM (ex: "25/12")
 *    - Déclenche chaque année à cette date à minuit
 * 
 * 3. timerFutureDate (ActionsId.timerFutureDate = 4):
 *    - data[0]: nombre de jours (ex: "3")
 *    - data[1]: date de création au format ISO (ex: "2025-11-04T12:00:00Z")
 *    - Déclenche une seule fois dans X jours à partir de la création
 */

// ==================== TIMER DAILY ====================
// Déclenche tous les jours à une heure précise (ex: 09:30)
createWebhook[ActionsId.timerDaily] = async (workflowId: number, data: string[]) => {
	console.log("createWebhook TimerDaily for workflow:", workflowId, "with data:", data);
	
	// Validation: doit avoir exactement 1 élément (l'heure HH:MM)
	if (data.length !== 1) {
		throw new Error("Timer Daily requires exactly 1 parameter: time in HH:MM format");
	}

	const timePattern = data[0];
	
	// Valider le format HH:MM
	const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
	if (!timeRegex.test(timePattern)) {
		throw new Error("Invalid time format. Expected HH:MM (00:00 to 23:59)");
	}

	// Vérifier que le workflow existe
	const workflow = await prisma.workflows.findUnique({
		where: { id: workflowId }
	});

	if (!workflow) {
		throw new Error("Workflow not found");
	}

	// Pas besoin de créer un webhook externe
	// Le worker va scanner la DB et déclencher les workflows au bon moment
	console.log(`Timer Daily configured: will trigger every day at ${timePattern}`);
};

deleteWebhook[ActionsId.timerDaily] = async (workflowId: number, data: string[]) => {
	console.log("deleteWebhook TimerDaily for workflow:", workflowId);
	
	// Pas de webhook externe à supprimer
	// La suppression du workflow dans la DB suffit
	console.log("Timer Daily trigger removed (workflow deleted)");
};

// ==================== TIMER DATE ====================
// Déclenche chaque année à une date spécifique (ex: 25/12)
createWebhook[ActionsId.timerDate] = async (workflowId: number, data: string[]) => {
	console.log("createWebhook TimerDate for workflow:", workflowId, "with data:", data);
	
	// Validation: doit avoir exactement 1 élément (la date DD/MM)
	if (data.length !== 1) {
		throw new Error("Timer Date requires exactly 1 parameter: date in DD/MM format");
	}

	const datePattern = data[0];
	
	// Valider le format DD/MM
	const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/;
	if (!dateRegex.test(datePattern)) {
		throw new Error("Invalid date format. Expected DD/MM (01/01 to 31/12)");
	}

	// Vérifier que le workflow existe
	const workflow = await prisma.workflows.findUnique({
		where: { id: workflowId }
	});

	if (!workflow) {
		throw new Error("Workflow not found");
	}

	console.log(`Timer Date configured: will trigger every year on ${datePattern}`);
};

deleteWebhook[ActionsId.timerDate] = async (workflowId: number, data: string[]) => {
	console.log("deleteWebhook TimerDate for workflow:", workflowId);
	console.log("Timer Date trigger removed (workflow deleted)");
};

// ==================== TIMER FUTURE DATE ====================
// Déclenche une fois dans X jours (ex: dans 3 jours)
createWebhook[ActionsId.timerFutureDate] = async (workflowId: number, data: string[]) => {
	console.log("createWebhook TimerFutureDate for workflow:", workflowId, "with data:", data);
	
	// Validation: doit avoir 1 ou 2 éléments
	// data[0]: nombre de jours
	// data[1] (optionnel): date de création ISO (si absent, on utilise now())
	if (data.length < 1 || data.length > 2) {
		throw new Error("Timer Future Date requires 1 or 2 parameters: days ahead and optional creation date");
	}

	const daysAhead = parseInt(data[0], 10);
	
	// Valider que c'est un nombre valide
	if (isNaN(daysAhead) || daysAhead < 1 || daysAhead > 365) {
		throw new Error("Days ahead must be a number between 1 and 365");
	}

	// Si pas de date de création fournie, on utilise maintenant
	let createdAt: Date;
	if (data.length === 2) {
		createdAt = new Date(data[1]);
		if (isNaN(createdAt.getTime())) {
			throw new Error("Invalid creation date format. Expected ISO date string");
		}
	} else {
		createdAt = new Date();
		// Mettre à jour actionData avec la date de création
		await prisma.workflows.update({
			where: { id: workflowId },
			data: {
				actionData: [data[0], createdAt.toISOString()]
			}
		});
	}

	// Calculer la date cible
	const targetDate = new Date(createdAt);
	targetDate.setDate(targetDate.getDate() + daysAhead);

	const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
	const targetDayName = dayNames[targetDate.getDay()];

	console.log(`Timer Future Date configured: will trigger on ${targetDate.toISOString()} (${targetDayName})`);
};

deleteWebhook[ActionsId.timerFutureDate] = async (workflowId: number, data: string[]) => {
	console.log("deleteWebhook TimerFutureDate for workflow:", workflowId);
	console.log("Timer Future Date trigger removed (workflow deleted)");
};
