export interface SocketMessage {
  type: string;
  payload: any;
  timestamp?: number;
  messageId?: string;
}

export interface SocketOptions {
  queue?: boolean;
  timeout?: number;
  acknowledgment?: boolean;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: number;
  messageId?: string;
}

export interface WebSocketOptions {
  queue?: boolean;
  timeout?: number;
}

// Message interfaces
export interface ClientMessage {
  type: ClientMessageType;
  payload?: any;
  timestamp: number;
  messageId: string;
}

export interface ServerMessage {
  type: ServerMessageType;
  payload?: any;
  timestamp: number;
  messageId?: string;
}

// Client-to-Server message types
export enum ClientMessageType {
  CREATE_GAME = 'CREATE_GAME',
  JOIN_GAME = 'JOIN_GAME',
  LEAVE_GAME = 'LEAVE_GAME',
  PLAYER_ACTION = 'PLAYER_ACTION',
  PLAYER_READY = 'PLAYER_READY',
  HEARTBEAT = 'HEARTBEAT',
}

// Server-to-Client message types
export enum ServerMessageType {
  GAME_CREATED = 'GAME_CREATED',
  GAME_STATE_UPDATE = 'GAME_STATE_UPDATE',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  PLAYER_UPDATE = 'PLAYER_UPDATE',
  PLAYER_POSITION_UPDATE = 'PLAYER_POSITION_UPDATE',
  ERROR = 'ERROR',
  HEARTBEAT = 'HEARTBEAT',
}

// Player position update payload
export interface PlayerPositionUpdate {
  playerId: string;
  position: {
    floor: number;
    x: number;
    y: number;
  };
  actionPoints?: number;
}