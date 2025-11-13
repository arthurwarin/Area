import { FastifyInstance } from "fastify";
import { userService } from "../services/userService";
import prisma from "../prismaClient";
import { AuthRequest, authMiddleware } from "../middlewares/authMiddleware";

async function userController(fastify: FastifyInstance) {

	fastify.post("/", async (request: AuthRequest, reply) => {
		try {
			const body = request.body as { email: string; password: string; role: string; };
			const newUser = await userService.create(body);
			await prisma.log.create({
				data: {
					level: "info",
					message: "User created by " + (request.user?.id ?? "signup"),
					context: "POST /user",
					metadata: JSON.stringify(newUser),
				}
			});
			return reply.status(201).send(newUser);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "POST /user",
				}
			});
			return reply.status(500).send({ error: "POST /user/ failed", context: "" + error });
		}
	});

	fastify.get("/", async (request: AuthRequest, reply) => {
		try {
			const users = await userService.findAll();
			return reply.status(200).send(users);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "GET /user",
				}
			});
			return reply.status(500).send({ error: "GET /user/ failed", context: "" + error });
		}
	});

	// Get current user information based on JWT token
	fastify.get("/me", { preHandler: [(req, reply) => authMiddleware(req, reply)] }, async (request: AuthRequest, reply) => {
		try {
			if (!request.user?.id) {
				return reply.status(401).send({ error: "Unauthorized" });
			}

			const user = await userService.findById(request.user.id as number);
			if (!user) {
				return reply.status(404).send({ error: "User not found" });
			}

			// Remove password from response for security
			const { password, ...userWithoutPassword } = user;
			return reply.status(200).send(userWithoutPassword);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "GET /user/me",
				}
			});
			return reply.status(500).send({ error: "GET /user/me failed", context: "" + error });
		}
	});

	// Update current user information
	fastify.put("/me", { preHandler: [(req, reply) => authMiddleware(req, reply)] }, async (request: AuthRequest, reply) => {
		try {
			if (!request.user?.id) {
				return reply.status(401).send({ error: "Unauthorized" });
			}

			const body = request.body as { email?: string; password?: string; currentPassword?: string; };

			// If changing password, verify current password first
			if (body.password && body.currentPassword) {
				const user = await userService.findById(request.user.id as number);
				if (!user) {
					return reply.status(404).send({ error: "User not found" });
				}

				const bcrypt = await import("bcryptjs");
				const validPassword = await bcrypt.compare(body.currentPassword, user.password);
				if (!validPassword) {
					return reply.status(400).send({ error: "Current password is incorrect" });
				}
			}

			// Remove currentPassword from update data
			const { currentPassword, ...updateData } = body;
			const updatedUser = await userService.update(request.user.id as number, updateData);

			await prisma.log.create({
				data: {
					level: "info",
					message: `User ${request.user.id} updated their profile`,
					context: "PUT /user/me",
					metadata: JSON.stringify({ updatedFields: Object.keys(updateData) }),
				}
			});

			// Remove password from response
			const { password, ...userWithoutPassword } = updatedUser;
			return reply.status(200).send(userWithoutPassword);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "PUT /user/me",
				}
			});
			return reply.status(500).send({ error: "PUT /user/me failed", context: "" + error });
		}
	});

	fastify.get("/:id", async (request: AuthRequest, reply) => {
		try {
			const id = Number((request.params as any).id);
			const user = await userService.findById(id);
			if (!user) return reply.status(404).send({ error: "User not found" });
			return reply.status(200).send(user);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "GET /user/:id",
				}
			});
			return reply.status(500).send({ error: "GET /user/:id failed", context: "" + error });
		}
	});

	fastify.put("/:id", async (request: AuthRequest, reply) => {
		try {
			const id = Number((request.params as any).id);
			const body = request.body as { email: string; password: string; role: string; };
			const updatedUser = await userService.update(id, body);
			await prisma.log.create({
				data: {
					level: "info",
					message: "User updated by " + (request.user?.id ?? request.ip),
					context: "PUT /user/:id",
					metadata: JSON.stringify(updatedUser),
				}
			});
			return reply.status(200).send(updatedUser);
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "PUT /user/:id",
				}
			});
			return reply.status(500).send({ error: "PUT /user/:id failed", context: "" + error });
		}
	});

	fastify.delete("/:id", async (request: AuthRequest, reply) => {
		try {
			const id = Number((request.params as any).id);
			await userService.delete(id);
			await prisma.log.create({
				data: {
					level: "info",
					message: "User deleted by " + (request.user?.id ?? request.ip),
					context: "DELETE /user/:id",
				}
			});
			return reply.status(204).send();
		} catch (error) {
			await prisma.log.create({
				data: {
					level: "error",
					message: "" + error,
					context: "DELETE /user/:id",
				}
			});
			return reply.status(500).send({ error: "DELETE /user/:id failed", context: "" + error });
		}
	});

}

export default userController;
