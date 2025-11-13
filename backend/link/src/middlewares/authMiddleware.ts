import { FastifyReply, FastifyRequest } from "fastify";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../prismaClient";

export interface AuthRequest extends FastifyRequest {
    user?: JwtPayload;
    authService?: boolean;
}

export const authMiddleware = async (req: AuthRequest, reply: FastifyReply) => {
    const apiKey = req.headers["x-api-key"] as string | undefined;
    if (apiKey && apiKey === process.env.AUTH_KEY!) {
        req.authService = true;
        return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        await prisma.log.create({
            data: {
                level: "denied",
                message: "Missing token from " + req.ip,
                context: "authMiddleware for route " + req.url,
            },
        });
        return reply.status(401).send("Missing token");
    }

    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = payload;
        return;
    } catch {
        await prisma.log.create({
            data: {
                level: "denied",
                message: "Invalid token from " + req.ip,
                context: "authMiddleware for route " + req.url,
            },
        });
        return reply.status(401).send("Invalid token");
    }
};
