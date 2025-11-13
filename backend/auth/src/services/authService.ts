import bcrypt from "bcryptjs";
import prisma from '../prismaClient'
import jwt from "jsonwebtoken";

export const authService = {
	signup: async (data: { email: string, password: string }) => {
		const existingUser = await prisma.users.findUnique({ where: { email: data.email } });
		if (existingUser) throw new Error("Email already used");

		const res = await fetch(`http://server:${process.env.API_PORT!}/user`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": process.env.AUTH_KEY!
			},
			body: JSON.stringify({
				email: data.email,
				password: data.password,
				role: "user"
			}),
		});

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({ message: res.statusText }));
			throw new Error("fetch error:" + (errorData.message || "Unknown error"));
		}
	},

	login: async (data: { email: string, password: string }) => {
		const user = await prisma.users.findUnique({ where: { email: data.email } });
		if (!user) throw new Error("Email or password is incorrect");

		const validPassword = await bcrypt.compare(data.password, user.password);
		if (!validPassword) throw new Error("Email or password is incorrect");

		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });
		return token;
	},

	microsoftAuth: async (data: { microsoftToken: string, email: string, displayName: string, microsoftId: string }) => {
		// Verify the Microsoft token (optional but recommended in production)
		// For now, we'll trust the token from the mobile app
		
		// Check if user exists by email or Microsoft ID
		let user = await prisma.users.findFirst({
			where: {
				OR: [
					{ email: data.email },
					{ microsoftId: data.microsoftId }
				]
			}
		});

		// If user doesn't exist, create a new one
		if (!user) {
			// Generate a random password for Microsoft OAuth users
			const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
			
			user = await prisma.users.create({
				data: {
					email: data.email,
					password: randomPassword,
					name: data.displayName,
					microsoftId: data.microsoftId,
					role: "user"
				}
			});

			await prisma.log.create({
				data: {
					level: "info",
					message: `New user created via Microsoft OAuth: ${data.email}`,
					context: "Microsoft OAuth",
					metadata: { microsoftId: data.microsoftId, displayName: data.displayName }
				}
			});
		} else {
			// Update existing user with Microsoft ID if not set
			if (!user.microsoftId) {
				user = await prisma.users.update({
					where: { id: user.id },
					data: { 
						microsoftId: data.microsoftId,
						name: data.displayName || user.name
					}
				});
			}

			await prisma.log.create({
				data: {
					level: "info",
					message: `User logged in via Microsoft OAuth: ${data.email}`,
					context: "Microsoft OAuth",
					metadata: { microsoftId: data.microsoftId }
				}
			});
		}

		// Generate JWT token
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "24h" });

		return {
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name
			}
		};
	}
};
