import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  TimerTriggerConfig,
  validateTimerConfig,
  getTimerDescription,
  getFutureDate,
} from '../services/timerService';
import prisma from '../prismaClient';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: number;
  };
}

/**
 * Timer controller - Manages timer-based triggers
 * Timer is an internal service, no OAuth required
 */
export default async function timerController(fastify: FastifyInstance) {
  /**
   * GET /timer/info
   * Get information about the Timer service
   */
  fastify.get('/timer/info', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    return {
      serviceName: 'timer',
      displayName: 'Timer',
      description: 'Déclenchez des actions basées sur la date et l\'heure',
      requiresAuth: false,
      availableTriggers: [
        {
          type: 'date',
          name: 'Date spécifique',
          description: 'Déclencher à une date précise chaque année (format DD/MM)',
          example: '25/12',
        },
        {
          type: 'time',
          name: 'Heure quotidienne',
          description: 'Déclencher tous les jours à une heure précise (format HH:MM)',
          example: '09:30',
        },
        {
          type: 'future_date',
          name: 'Date future',
          description: 'Déclencher dans X jours (par exemple "dans 3 jours ce sera vendredi")',
          example: 3,
        },
      ],
    };
  });

  /**
   * POST /timer/create
   * Create a timer trigger configuration
   * Body: TimerTriggerConfig
   */
  fastify.post('/timer/create', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user?.userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const config = request.body as TimerTriggerConfig;
      
      // Validate configuration
      validateTimerConfig(config);
      
      // Generate description
      const description = config.description || getTimerDescription(config);
      
      // Store configuration in database (will need to extend schema for this)
      // For now, return success with configuration details
      return {
        success: true,
        message: 'Timer trigger created successfully',
        config: {
          ...config,
          description,
        },
      };
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  });

  /**
   * POST /timer/validate
   * Validate a timer trigger configuration without saving
   * Body: TimerTriggerConfig
   */
  fastify.post('/timer/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const config = request.body as TimerTriggerConfig;
      validateTimerConfig(config);
      
      const description = getTimerDescription(config);
      
      return {
        valid: true,
        description,
      };
    } catch (error: any) {
      return reply.status(400).send({ 
        valid: false,
        error: error.message 
      });
    }
  });

  /**
   * GET /timer/preview/future?days=X
   * Preview what date will be in X days
   */
  fastify.get('/timer/preview/future', async (request: FastifyRequest, reply: FastifyReply) => {
    const { days } = request.query as { days?: string };
    
    if (!days) {
      return reply.status(400).send({ error: 'days parameter is required' });
    }
    
    const daysAhead = parseInt(days, 10);
    
    if (isNaN(daysAhead) || daysAhead < 1 || daysAhead > 365) {
      return reply.status(400).send({ error: 'days must be between 1 and 365' });
    }
    
    const future = getFutureDate(daysAhead);
    
    return {
      daysAhead,
      targetDate: future.date,
      dayName: future.dayName,
      description: future.fullDescription,
    };
  });

  /**
   * GET /timer/current
   * Get current date and time
   */
  fastify.get('/timer/current', async (request: FastifyRequest, reply: FastifyReply) => {
    const now = new Date();
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = dayNames[now.getDay()];
    
    return {
      date: `${day}/${month}`,
      time: `${hour}:${minute}`,
      dayName,
      timestamp: now.toISOString(),
    };
  });
}
