import prisma from "../prismaClient";

export const serviceService = {
	// Get all services with their actions
	async getAllServices() {
		try {
			const services = await prisma.services.findMany({
				include: {
					actions: {
						select: {
							id: true,
							name: true,
							description: true
						}
					},
					reactions: {
						select: {
							id: true,
							name: true,
							description: true,
						}
					}
				}
			});
			return services;
		} catch (error) {
			throw new Error(`Failed to fetch services: ${error}`);
		}
	},

	// Get a specific service by name with its actions
	async getServiceByName(name: string) {
		try {
			const service = await prisma.services.findUnique({
				where: { name },
				include: {
					actions: {
						select: {
							id: true,
							name: true,
							description: true
						}
					},
					reactions: {
						select: {
							id: true,
							name: true,
							description: true,
						}
					}
				}
			});

			if (!service) {
				throw new Error(`Service with name ${name} not found`);
			}

			return service;
		} catch (error) {
			throw new Error(`Failed to fetch service: ${error}`);
		}
	}
};
