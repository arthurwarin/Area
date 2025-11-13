import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../prismaClient";

export interface AuthRequest extends FastifyRequest {
	user?: JwtPayload;
	authService?: boolean;
}

export const adminMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
	if (req.user?.id) {
		const user = await prisma.users.findUnique({ where: { id: req.user.id as number } });
		if (!user) {
			return reply.status(401).send("Missing token");
		}

		if (user.role === "admin") {
			return;
		}
	}

	await prisma.log.create({
		data: {
			level: "denied",
			message: "User isn't Admin from " + req.ip,
			context: "adminMiddleware for route " + req.url,
		},
	});

	return reply.status(401).send("User is not an admin");
};
