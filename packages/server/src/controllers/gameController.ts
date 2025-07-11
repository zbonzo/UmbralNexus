import { Request, Response } from 'express';
import { GameManager } from '../game-engine/gameManager';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Validation schemas
const createGameSchema = z.object({
  name: z.string().min(1).max(50),
  hostId: z.string().min(1),
  playerCap: z.number().int().min(1).max(20),
  difficulty: z.enum(['normal', 'hard', 'nightmare']),
  endConditions: z.object({
    type: z.enum(['TIME_LIMIT', 'DEATH_COUNT', 'FLOOR_COUNT']),
    value: z.number().int().min(1),
  }),
});

const joinGameSchema = z.object({
  gameId: z.string().length(6),
  playerId: z.string().min(1),
  name: z.string().min(1).max(30),
  class: z.enum(['warrior', 'ranger', 'mage', 'cleric']),
});

const gameActionSchema = z.object({
  gameId: z.string().length(6),
  playerId: z.string().min(1),
  action: z.object({
    type: z.enum(['MOVE', 'ATTACK', 'USE_ABILITY', 'USE_ITEM']),
  }).passthrough(),
});

export class GameController {
  private gameManager: GameManager;

  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
  }

  public createGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createGameSchema.parse(req.body);
      
      const { gameId, game } = await this.gameManager.createGame(validatedData);

      res.status(201).json({
        success: true,
        data: {
          gameId,
          name: game.name,
          host: game.host,
          config: game.config,
          currentPhase: game.currentPhase,
          playerCount: game.players.length,
          createdAt: game.createdAt,
        },
      });

      logger.info(`Game created via API: ${gameId}`);
    } catch (error) {
      logger.error('Error creating game:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid game configuration',
            details: error.errors,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create game',
        },
      });
    }
  };

  public joinGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = joinGameSchema.parse(req.body);
      
      const game = await this.gameManager.joinGame(validatedData.gameId, {
        playerId: validatedData.playerId,
        name: validatedData.name,
        class: validatedData.class,
      });

      res.status(200).json({
        success: true,
        data: {
          gameId: game.gameId,
          name: game.name,
          host: game.host,
          config: game.config,
          currentPhase: game.currentPhase,
          playerCount: game.players.length,
          players: game.players.map(p => ({
            playerId: p.playerId,
            name: p.name,
            class: p.class,
            level: p.level,
            health: p.health,
            maxHealth: p.maxHealth,
            joinedAt: p.joinedAt,
          })),
        },
      });

      logger.info(`Player joined game via API: ${validatedData.playerId} -> ${validatedData.gameId}`);
    } catch (error) {
      logger.error('Error joining game:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid join request',
            details: error.errors,
          },
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Unknown error';
      let statusCode = 500;
      
      if (message.includes('not found')) {
        statusCode = 404;
      } else if (message.includes('full') || message.includes('already in game')) {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: 'GAME_ERROR',
          message,
        },
      });
    }
  };

  public getGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameId } = req.params;
      
      if (!gameId || gameId.length !== 6) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid game ID',
          },
        });
        return;
      }

      const game = this.gameManager.getGame(gameId);
      
      if (!game) {
        res.status(404).json({
          success: false,
          error: {
            code: 'GAME_NOT_FOUND',
            message: 'Game not found',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          gameId: game.gameId,
          name: game.name,
          host: game.host,
          config: game.config,
          currentPhase: game.currentPhase,
          playerCount: game.players.length,
          players: game.players.map(p => ({
            playerId: p.playerId,
            name: p.name,
            class: p.class,
            level: p.level,
            health: p.health,
            maxHealth: p.maxHealth,
            joinedAt: p.joinedAt,
          })),
          createdAt: game.createdAt,
          startTime: game.startTime,
        },
      });

    } catch (error) {
      logger.error('Error getting game:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get game',
        },
      });
    }
  };

  public startGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { hostId } = req.body;

      if (!gameId || gameId.length !== 6) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid game ID',
          },
        });
        return;
      }

      if (!hostId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Host ID is required',
          },
        });
        return;
      }

      await this.gameManager.startGame(gameId, hostId);

      res.status(200).json({
        success: true,
        data: {
          gameId,
          message: 'Game started successfully',
          timestamp: new Date().toISOString(),
        },
      });

      logger.info(`Game started via API: ${gameId}`);
    } catch (error) {
      logger.error('Error starting game:', error);
      
      const message = error instanceof Error ? error.message : 'Unknown error';
      let statusCode = 500;
      
      if (message.includes('not found')) {
        statusCode = 404;
      } else if (message.includes('Only the host') || message.includes('no players')) {
        statusCode = 403;
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code: 'GAME_ERROR',
          message,
        },
      });
    }
  };

  public leaveGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.body;

      if (!gameId || gameId.length !== 6) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid game ID',
          },
        });
        return;
      }

      if (!playerId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Player ID is required',
          },
        });
        return;
      }

      await this.gameManager.leaveGame(gameId, playerId);

      res.status(200).json({
        success: true,
        data: {
          gameId,
          playerId,
          message: 'Left game successfully',
          timestamp: new Date().toISOString(),
        },
      });

      logger.info(`Player left game via API: ${playerId} -> ${gameId}`);
    } catch (error) {
      logger.error('Error leaving game:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to leave game',
        },
      });
    }
  };

  public getGameStats = async (req: Request, res: Response): Promise<void> => {
    try {
      res.status(200).json({
        success: true,
        data: {
          activeGames: this.gameManager.getActiveGameCount(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error getting game stats:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get game stats',
        },
      });
    }
  };
}