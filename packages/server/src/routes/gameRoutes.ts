import { Router } from 'express';
import { GameController } from '../controllers/gameController';
import { GameManager } from '../game-engine/gameManager';
import { ConnectionManager } from '../websocket/connectionManager';

export function createGameRoutes(connectionManager: ConnectionManager): Router {
  const router = Router();
  const gameManager = new GameManager(connectionManager);
  const gameController = new GameController(gameManager);

  // Game management routes
  router.post('/games', gameController.createGame);
  router.get('/games/:gameId', gameController.getGame);
  router.post('/games/:gameId/join', gameController.joinGame);
  router.post('/games/:gameId/start', gameController.startGame);
  router.post('/games/:gameId/leave', gameController.leaveGame);

  // Game statistics
  router.get('/stats', gameController.getGameStats);

  return router;
}