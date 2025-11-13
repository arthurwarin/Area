import { FastifyInstance } from "fastify";
import { serviceService } from "../services/serviceService";
import prisma from "../prismaClient";
import { AuthRequest } from "../middlewares/authMiddleware";

async function serviceController(fastify: FastifyInstance) {

    // GET /services - Get all services with their actions
    fastify.get("/", async (request: AuthRequest, reply) => {
        try {
            const services = await serviceService.getAllServices();
            
            await prisma.log.create({
                data: {
                    level: "info",
                    message: "Services fetched by user " + (request.user?.id ?? "anonymous"),
                    context: "GET /services/",
                    metadata: JSON.stringify({ count: services.length }),
                }
            });

            return reply.status(200).send(services);
        } catch (error) {
            await prisma.log.create({
                data: {
                    level: "error",
                    message: "" + error,
                    context: "GET /services/",
                }
            });
            return reply.status(500).send({ error: "Failed to fetch services", context: "" + error });
        }
    });

    // GET /services/:name - Get a specific service by name with its actions
    fastify.get("/:name", async (request: AuthRequest, reply) => {
        try {
            const { name } = request.params as { name: string };
            const service = await serviceService.getServiceByName(name);
            
            await prisma.log.create({
                data: {
                    level: "info",
                    message: `Service ${name} fetched by user ` + (request.user?.id ?? "anonymous"),
                    context: "GET /services/:name",
                    metadata: JSON.stringify({ serviceName: name }),
                }
            });

            return reply.status(200).send(service);
        } catch (error) {
            await prisma.log.create({
                data: {
                    level: "error",
                    message: "" + error,
                    context: "GET /services/:name",
                }
            });
            return reply.status(404).send({ error: "Service not found", context: "" + error });
        }
    });
}

export default serviceController;