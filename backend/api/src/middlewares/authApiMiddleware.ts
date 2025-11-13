import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../prismaClient";

export interface AuthRequest extends FastifyRequest {
	user?: JwtPayload;
	authService?: boolean;
}

export const authApiMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
	const isUserValid =
		req.authService ||
		(req.user?.id && (await prisma.users.findUnique({ where: { id: req.user.id as number } })));

	if (isUserValid) {
		return;
	}

	await prisma.log.create({
		data: {
			level: "denied",
			message: "Neither Admin nor AuthAPI from " + req.ip,
			context: "authApiMiddleware for route " + req.url,
		},
	});

	return reply.status(401).send("User is not an admin");
};
