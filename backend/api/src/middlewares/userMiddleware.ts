import { FastifyReply, FastifyRequest } from "fastify";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../prismaClient";

export interface AuthRequest extends FastifyRequest {
    user?: JwtPayload;
    authService?: boolean;
    params: { [key: string]: string | number };
}

export const userMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
    if (req.user?.id) {
		const user = await prisma.users.findUnique({ where: { id: req.user.id as number } });
		if (!user) {
			return reply.status(401).send("Missing token");
		}

		if (user.role !== "admin") {
			req.params.id = String(user.id);
		}

		return;
    } else {
		await prisma.log.create({
			data: {
				level: "denied",
				message: "Missing token from " + req.ip,
				context: "userMiddleware for route " + req.url,
			},
		});

		return reply.status(401).send("Missing token");
    }
};
