import bcrypt from "bcryptjs";
import prisma from "../prismaClient";

export const userService = {
	create: async (data: { email: string; password: string; role: string }) => {
		const existingUser = await prisma.users.findUnique({ where: { email: data.email } });
		if (existingUser) throw new Error("Email already used");

		const hashedPassword = await bcrypt.hash(data.password, 10);
		return prisma.users.create({
			data: {
				email: data.email,
				password: hashedPassword,
				role: data.role,
			},
		});
	},

	findAll: async () => {
		return prisma.users.findMany();
	},

	findById: async (id: number) => {
		return prisma.users.findUnique({ where: { id } });
	},

	update: async (
		id: number,
		data: { email?: string; password?: string; role?: string }
	) => {
		const updateData: typeof data = { ...data };

		if (data.password) {
			updateData.password = await bcrypt.hash(data.password, 10);
		}

		return prisma.users.update({
			where: { id },
			data: updateData,
		});
	},

	delete: async (id: number) => {
		return prisma.users.delete({ where: { id } });
	},
};
