import prisma from "../prismaClient";

interface DiscordTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export async function getUserConnections(userId: number) {
    const connections = await prisma.userService.findMany({
        where: { userId },
        include: {
            service: true,
        },
    });

    // Don't expose tokens in the response
    return connections.map((conn: { id: number; service: { name: string }; createdAt: Date; updatedAt: Date }) => ({
        id: conn.id,
        serviceName: conn.service.name,
        connected: true,
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
    }));
}

export async function getConnectionByService(userId: number, serviceName: string) {
    const service = await prisma.services.findUnique({
        where: { name: serviceName.toLowerCase() },
    });

    if (!service) {
        throw new Error(`Service ${serviceName} not found`);
    }

    const connection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: service.id,
        },
        include: {
            service: true,
        },
    });

    if (!connection) {
        return null;
    }

    return {
        id: connection.id,
        serviceName: connection.service.name,
        connected: true,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
    };
}

export async function disconnectService(userId: number, serviceName: string) {
    const service = await prisma.services.findUnique({
        where: { name: serviceName.toLowerCase() },
    });

    if (!service) {
        throw new Error(`Service ${serviceName} not found`);
    }

    const connection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: service.id,
        },
    });

    if (!connection) {
        throw new Error(`Connection not found`);
    }

    await prisma.userService.delete({
        where: {
            id: connection.id,
        },
    });

    await prisma.log.create({
        data: {
            level: "info",
            message: `User ${userId} disconnected ${serviceName}`,
            context: "Disconnect service",
        },
    });

    return true;
}

export async function refreshServiceToken(userId: number, serviceName: string) {
    const service = await prisma.services.findUnique({
        where: { name: serviceName.toLowerCase() },
    });

    if (!service) {
        throw new Error(`Service ${serviceName} not found`);
    }

    const connection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: service.id,
        },
    });

    if (!connection || !connection.refreshToken) {
        throw new Error("No refresh token available");
    }

    // Refresh token based on service
    if (serviceName.toLowerCase() === "discord") {
        return await refreshDiscordToken(connection);
    } else if (serviceName.toLowerCase() === "github") {
        throw new Error("GitHub tokens don't expire, no refresh needed");
    }

    throw new Error(`Refresh not implemented for ${serviceName}`);
}

async function refreshDiscordToken(connection: any) {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID!,
            client_secret: process.env.DISCORD_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: connection.refreshToken!,
        }),
    });

    if (!tokenResponse.ok) {
        throw new Error("Failed to refresh Discord token");
    }

    const tokenData = await tokenResponse.json() as DiscordTokenResponse;

    // Update the connection with new tokens
    const updated = await prisma.userService.update({
        where: { id: connection.id },
        data: {
            token: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            updatedAt: new Date(),
        },
    });

    await prisma.log.create({
        data: {
            level: "info",
            message: `Refreshed Discord token for user ${connection.userId}`,
            context: "Token refresh",
        },
    });

    return updated;
}

// Helper function to get a valid token (refresh if needed)
export async function getValidToken(userId: number, serviceName: string): Promise<string> {
    const service = await prisma.services.findUnique({
        where: { name: serviceName.toLowerCase() },
    });

    if (!service) {
        throw new Error(`Service ${serviceName} not found`);
    }

    const connection = await prisma.userService.findFirst({
        where: {
            userId: userId,
            serviceId: service.id,
        },
    });

    if (!connection) {
        throw new Error(`User not connected to ${serviceName}`);
    }

    // For Discord, you might want to check expiration and refresh
    // For now, just return the token
    return connection.token;
}