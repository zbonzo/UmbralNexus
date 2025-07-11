import { Router } from 'express';
import { createGameRoutes } from '../routes/gameRoutes';
import { ConnectionManager } from '../websocket/connectionManager';
import { GameManager } from '../game-engine/gameManager';
import { GameController } from '../controllers/gameController';

// Mock dependencies
jest.mock('../game-engine/gameManager');
jest.mock('../websocket/connectionManager');

// Mock GameController with actual function handlers
jest.mock('../controllers/gameController', () => {
  return {
    GameController: jest.fn().mockImplementation(() => ({
      createGame: jest.fn(),
      getGame: jest.fn(),
      joinGame: jest.fn(),
      startGame: jest.fn(),
      leaveGame: jest.fn(),
      getGameStats: jest.fn(),
    }))
  };
});

describe('Game Routes', () => {
  let mockConnectionManager: jest.Mocked<ConnectionManager>;
  let router: Router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConnectionManager = {
      broadcastToGame: jest.fn(),
    } as any;

    router = createGameRoutes(mockConnectionManager);
  });

  describe('createGameRoutes', () => {
    it('should create a router instance', () => {
      expect(router).toBeDefined();
      expect(typeof router).toBe('function'); // Express router is a function
    });

    it('should instantiate GameManager with ConnectionManager', () => {
      expect(GameManager).toHaveBeenCalledWith(mockConnectionManager);
    });

    it('should instantiate GameController with GameManager', () => {
      const mockGameManager = (GameManager as jest.MockedClass<typeof GameManager>).mock.instances[0];
      expect(GameController).toHaveBeenCalledWith(mockGameManager);
    });

    it('should set up all required routes', () => {
      // Verify the router was created and GameController was instantiated
      expect(GameController).toHaveBeenCalled();
      expect(router).toBeDefined();
      
      // The routes should be configured (we test the actual routes in other tests)
      const routerStack = (router as any).stack;
      expect(routerStack).toHaveLength(6);
    });

    it('should return an Express Router', () => {
      const routerStack = (router as any).stack;
      expect(Array.isArray(routerStack)).toBe(true);
    });

    it('should configure routes with correct HTTP methods', () => {
      const routerStack = (router as any).stack;
      
      // Count routes by method
      const routes = routerStack.map((layer: any) => ({
        method: Object.keys(layer.route.methods)[0],
        path: layer.route.path
      }));

      // Check that we have the expected routes
      expect(routes.some(r => r.method === 'post' && r.path === '/games')).toBe(true);
      expect(routes.some(r => r.method === 'get' && r.path === '/games/:gameId')).toBe(true);
      expect(routes.some(r => r.method === 'post' && r.path === '/games/:gameId/join')).toBe(true);
      expect(routes.some(r => r.method === 'post' && r.path === '/games/:gameId/start')).toBe(true);
      expect(routes.some(r => r.method === 'post' && r.path === '/games/:gameId/leave')).toBe(true);
      expect(routes.some(r => r.method === 'get' && r.path === '/stats')).toBe(true);
    });

    it('should have exactly 6 routes configured', () => {
      const routerStack = (router as any).stack;
      expect(routerStack).toHaveLength(6);
    });

    it('should handle multiple router instances independently', () => {
      const mockConnectionManager2 = {
        broadcastToGame: jest.fn(),
      } as any;

      const router2 = createGameRoutes(mockConnectionManager2);
      
      expect(router2).toBeDefined();
      expect(router2).not.toBe(router);
      expect(GameManager).toHaveBeenCalledTimes(2);
      expect(GameController).toHaveBeenCalledTimes(2);
    });

    it('should pass through connectionManager to GameManager', () => {
      // Verify the connectionManager is passed correctly
      expect(GameManager).toHaveBeenCalledWith(mockConnectionManager);
      
      // Create another instance to verify it's passed through each time
      const anotherConnectionManager = {} as ConnectionManager;
      createGameRoutes(anotherConnectionManager);
      
      expect(GameManager).toHaveBeenLastCalledWith(anotherConnectionManager);
    });
  });

  describe('Route Configuration Details', () => {
    it('should configure POST /games route', () => {
      const routerStack = (router as any).stack;
      const postGamesRoute = routerStack.find((layer: any) => 
        layer.route.path === '/games' && layer.route.methods.post
      );
      
      expect(postGamesRoute).toBeDefined();
    });

    it('should configure GET /games/:gameId route', () => {
      const routerStack = (router as any).stack;
      const getGameRoute = routerStack.find((layer: any) => 
        layer.route.path === '/games/:gameId' && layer.route.methods.get
      );
      
      expect(getGameRoute).toBeDefined();
    });

    it('should configure POST /games/:gameId/join route', () => {
      const routerStack = (router as any).stack;
      const joinGameRoute = routerStack.find((layer: any) => 
        layer.route.path === '/games/:gameId/join' && layer.route.methods.post
      );
      
      expect(joinGameRoute).toBeDefined();
    });

    it('should configure POST /games/:gameId/start route', () => {
      const routerStack = (router as any).stack;
      const startGameRoute = routerStack.find((layer: any) => 
        layer.route.path === '/games/:gameId/start' && layer.route.methods.post
      );
      
      expect(startGameRoute).toBeDefined();
    });

    it('should configure POST /games/:gameId/leave route', () => {
      const routerStack = (router as any).stack;
      const leaveGameRoute = routerStack.find((layer: any) => 
        layer.route.path === '/games/:gameId/leave' && layer.route.methods.post
      );
      
      expect(leaveGameRoute).toBeDefined();
    });

    it('should configure GET /stats route', () => {
      const routerStack = (router as any).stack;
      const statsRoute = routerStack.find((layer: any) => 
        layer.route.path === '/stats' && layer.route.methods.get
      );
      
      expect(statsRoute).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined connectionManager gracefully', () => {
      expect(() => createGameRoutes(undefined as any)).not.toThrow();
    });

    it('should handle null connectionManager gracefully', () => {
      expect(() => createGameRoutes(null as any)).not.toThrow();
    });
  });

  describe('Route Handler Binding', () => {
    it('should bind controller methods correctly', () => {
      // Verify that GameController was instantiated (which means the methods exist)
      expect(GameController).toHaveBeenCalled();
      
      // Verify all routes are configured
      const routerStack = (router as any).stack;
      expect(routerStack).toHaveLength(6);
      
      // Each route should have a handler
      routerStack.forEach((layer: any) => {
        expect(layer.route.stack[0].handle).toBeDefined();
        expect(typeof layer.route.stack[0].handle).toBe('function');
      });
    });
  });
});