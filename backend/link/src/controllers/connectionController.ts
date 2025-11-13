import { FastifyInstance } from "fastify";
import { authMiddleware, AuthRequest } from "../middlewares/authMiddleware";
import * as connectionService from "../services/connectionService";

export default async function connectionController(app: FastifyInstance) {
    app.get("/", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        try {
            const userId = req.user.userId || req.user.id;
            const connections = await connectionService.getUserConnections(userId);
            return reply.status(200).send(connections);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    app.get("/:serviceName", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { serviceName } = req.params as { serviceName: string };

        try {
            const userId = req.user.userId || req.user.id;
            const connection = await connectionService.getConnectionByService(
                userId,
                serviceName
            );
            
            if (!connection) {
                return reply.status(404).send({ error: "Connection not found" });
            }

            return reply.status(200).send(connection);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    // Disconnect a service
    app.delete("/:serviceName", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { serviceName } = req.params as { serviceName: string };

        try {
            const userId = req.user.userId || req.user.id;
            await connectionService.disconnectService(userId, serviceName);
            return reply.status(200).send({ message: `${serviceName} disconnected successfully` });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    // Refresh token for a service
    app.post("/:serviceName/refresh", { preHandler: authMiddleware }, async (req: AuthRequest, reply) => {
        if (!req.user?.id) {
            return reply.status(401).send({ error: "Unauthorized" });
        }

        const { serviceName } = req.params as { serviceName: string };

        try {
            const userId = req.user.userId || req.user.id;
            const connection = await connectionService.refreshServiceToken(
                userId,
                serviceName
            );
            return reply.status(200).send({ message: "Token refreshed", connection });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });
}
