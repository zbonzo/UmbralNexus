import type { GameConfig, Player, CharacterClass } from '@umbral-nexus/shared';

export interface CreateGameRequest {
  name: string;
  hostId: string;
  hostName: string;
  playerCap: number;
  difficulty: 'normal' | 'hard' | 'nightmare';
  endConditions: {
    type: 'TIME_LIMIT' | 'DEATH_COUNT' | 'FLOOR_COUNT';
    value: number;
  };
}

export interface JoinGameRequest {
  gameId: string;
  playerId: string;
  name: string;
  class: CharacterClass;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface GameInfo {
  gameId: string;
  name: string;
  host: string;
  config: GameConfig;
  currentPhase: 'lobby' | 'active' | 'victory' | 'defeat';
  playerCount: number;
  players: Player[];
  createdAt: string;
  startTime?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = `http://${window.location.hostname}:8888`) {
    this.baseUrl = baseUrl;
  }

  async createGame(request: CreateGameRequest): Promise<GameInfo> {
    const response = await fetch(`${this.baseUrl}/api/games`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result: ApiResponse<GameInfo> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to create game');
    }

    return result.data;
  }

  async joinGame(request: JoinGameRequest): Promise<GameInfo> {
    const response = await fetch(`${this.baseUrl}/api/games/${request.gameId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result: ApiResponse<GameInfo> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to join game');
    }

    return result.data;
  }

  async getGame(gameId: string): Promise<GameInfo> {
    const response = await fetch(`${this.baseUrl}/api/games/${gameId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<GameInfo> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to get game');
    }

    return result.data;
  }

  async startGame(gameId: string, hostId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/games/${gameId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hostId }),
    });

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to start game');
    }
  }

  async leaveGame(gameId: string, playerId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/games/${gameId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    });

    const result: ApiResponse<any> = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to leave game');
    }
  }

  async getStats(): Promise<{ activeGames: number; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/api/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ApiResponse<{ activeGames: number; timestamp: string }> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Failed to get stats');
    }

    return result.data;
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }
}