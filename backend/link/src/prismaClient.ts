import { PrismaClient } from '../../shared/prisma/client';

const prisma = new PrismaClient();

export default prisma;

const shutdown = async (signal: string) => {
	console.log(`Reçu ${signal}, fermeture de Prisma...`);
	await prisma.$disconnect();
	process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", async (err) => {
	console.error("Uncaught Exception:", err);
	await prisma.$disconnect();
	process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
	console.error("Unhandled Rejection:", reason);
	await prisma.$disconnect();
	process.exit(1);
});
