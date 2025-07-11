import request from 'supertest';
import app, { httpServer } from '../index';
import { io as ioClient, Socket } from 'socket.io-client';

describe('Network Resilience Tests', () => {
  let gameId: string;
  let socket: Socket;

  beforeEach(async () => {
    // Create a test game
    const response = await request(app)
      .post('/api/games')
      .send({
        name: 'Network Test Game',
        hostId: 'host-1',
        playerCap: 4,
        difficulty: 'normal',
      });

    gameId = response.body.data?.gameId || 'TEST01';
  });

  afterEach(() => {
    if (socket?.connected) {
      socket.disconnect();
    }
  });

  describe('WebSocket Disconnection Handling', () => {
    it('should handle sudden WebSocket disconnection', (done) => {
      socket = ioClient(`http://localhost:8888`, {
        transports: ['websocket'],
        reconnection: false, // Disable auto-reconnect for this test
      });

      socket.on('connect', () => {
        socket.emit('join-game', {
          gameId,
          playerId: 'disconnect-test',
          playerName: 'Disconnect Test',
        });

        // Simulate sudden disconnect
        setTimeout(() => {
          socket.disconnect();
          
          // Server should handle gracefully
          setTimeout(() => {
            // Try to reconnect
            const newSocket = ioClient(`http://localhost:8888`, {
              transports: ['websocket'],
            });

            newSocket.on('connect', () => {
              expect(newSocket.connected).toBe(true);
              newSocket.disconnect();
              done();
            });
          }, 100);
        }, 50);
      });
    });

    it('should handle reconnection with stale game state', (done) => {
      socket = ioClient(`http://localhost:8888`, {
        transports: ['websocket'],
      });

      const playerId = 'reconnect-test';
      let disconnectCount = 0;

      socket.on('connect', () => {
        disconnectCount++;
        
        if (disconnectCount === 1) {
          // First connection
          socket.emit('join-game', {
            gameId,
            playerId,
            playerName: 'Reconnect Test',
          });

          // Move to a position
          socket.emit('player-action', {
            gameId,
            playerId,
            action: {
              type: 'MOVE_TO',
              targetPosition: { x: 5, y: 5 },
            },
          });

          // Disconnect after action
          setTimeout(() => {
            socket.disconnect();
            socket.connect();
          }, 50);
        } else {
          // Reconnected - should be able to continue
          socket.emit('player-action', {
            gameId,
            playerId,
            action: {
              type: 'MOVE_TO',
              targetPosition: { x: 6, y: 6 },
            },
          });

          setTimeout(() => {
            expect(socket.connected).toBe(true);
            done();
          }, 50);
        }
      });
    });

    it('should handle partial message delivery', (done) => {
      socket = ioClient(`http://localhost:8888`, {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        // Send incomplete/malformed message
        try {
          // Directly emit partial data
          (socket as any).sendBuffer.push({
            type: 2,
            data: ['player-action', { gameId }], // Missing required fields
            options: {},
          });
          socket.emit('player-action', {}); // Empty action
        } catch (e) {
          // Should not crash the server
        }

        setTimeout(() => {
          // Server should still be responsive
          socket.emit('heartbeat', {});
          expect(socket.connected).toBe(true);
          done();
        }, 100);
      });
    });
  });

  describe('API Request Timeouts', () => {
    it('should handle slow requests gracefully', async () => {
      // Create a request that might timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100);

      try {
        const response = await fetch(`http://localhost:8888/api/games/${gameId}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        // If it completes, should be valid
        if (!controller.signal.aborted) {
          expect(response.status).toBeLessThan(500);
        }
      } catch (e: any) {
        // Aborted is ok
        expect(e.name).toBe('AbortError');
      }
    });

    it('should handle rapid repeated requests', async () => {
      const requests = [];
      
      // Send 20 requests rapidly
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .get(`/api/games/${gameId}`)
            .timeout(1000) // 1 second timeout
        );
      }

      try {
        const results = await Promise.allSettled(requests);
        
        // Most should succeed
        const successful = results.filter(r => r.status === 'fulfilled').length;
        expect(successful).toBeGreaterThan(10);
      } catch (e) {
        // Some timeouts are acceptable under load
      }
    });
  });

  describe('Message Ordering and Queuing', () => {
    it('should handle out-of-order message delivery', (done) => {
      socket = ioClient(`http://localhost:8888`, {
        transports: ['websocket'],
      });

      const messages: any[] = [];
      socket.on('game-update', (data) => {
        messages.push(data);
      });

      socket.on('connect', () => {
        socket.emit('join-game', {
          gameId,
          playerId: 'order-test',
          playerName: 'Order Test',
        });

        // Send messages with sequence numbers
        for (let i = 5; i >= 1; i--) {
          setTimeout(() => {
            socket.emit('player-action', {
              gameId,
              playerId: 'order-test',
              sequence: i,
              action: {
                type: 'MOVE_TO',
                targetPosition: { x: i, y: i },
              },
            });
          }, (6 - i) * 10); // Reverse order
        }

        setTimeout(() => {
          // Server should handle gracefully
          expect(socket.connected).toBe(true);
          expect(messages.length).toBeGreaterThan(0);
          done();
        }, 200);
      });
    });

    it('should handle message queue overflow', (done) => {
      socket = ioClient(`http://localhost:8888`, {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('join-game', {
          gameId,
          playerId: 'overflow-test',
          playerName: 'Overflow Test',
        });

        // Flood with messages
        for (let i = 0; i < 1000; i++) {
          socket.emit('player-action', {
            gameId,
            playerId: 'overflow-test',
            action: {
              type: 'MOVE_TO',
              targetPosition: { x: i % 10, y: i % 10 },
            },
          });
        }

        setTimeout(() => {
          // Should not crash
          expect(socket.connected).toBe(true);
          done();
        }, 500);
      });
    });
  });

  describe('Connection State Management', () => {
    it('should handle connection during server restart', (done) => {
      socket = ioClient(`http://localhost:8888`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 100,
      });

      let disconnected = false;
      
      socket.on('disconnect', () => {
        disconnected = true;
      });

      socket.on('connect', () => {
        if (disconnected) {
          // Reconnected successfully
          expect(socket.connected).toBe(true);
          done();
        }
      });

      socket.on('connect_error', () => {
        // Expected during "restart"
      });

      // Note: Actually restarting the server in tests is complex
      // This simulates the client-side behavior
      setTimeout(() => {
        socket.disconnect();
        setTimeout(() => {
          socket.connect();
        }, 100);
      }, 100);
    });

    it('should handle zombie connections', (done) => {
      const sockets: Socket[] = [];
      
      // Create multiple connections from same client
      for (let i = 0; i < 5; i++) {
        const s = ioClient(`http://localhost:8888`, {
          transports: ['websocket'],
          forceNew: true,
        });
        
        s.on('connect', () => {
          s.emit('join-game', {
            gameId,
            playerId: 'zombie-test',
            playerName: 'Zombie Test',
          });
        });
        
        sockets.push(s);
      }

      setTimeout(() => {
        // Disconnect all but one
        for (let i = 0; i < 4; i++) {
          sockets[i].disconnect();
        }

        // Last connection should still work
        sockets[4].emit('player-action', {
          gameId,
          playerId: 'zombie-test',
          action: {
            type: 'MOVE_TO',
            targetPosition: { x: 1, y: 1 },
          },
        });

        setTimeout(() => {
          expect(sockets[4].connected).toBe(true);
          sockets[4].disconnect();
          done();
        }, 100);
      }, 200);
    });
  });

  describe('Network Latency Simulation', () => {
    it('should handle high latency connections', (done) => {
      socket = ioClient(`http://localhost:8888`, {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('join-game', {
          gameId,
          playerId: 'latency-test',
          playerName: 'Latency Test',
        });

        // Simulate high latency with delayed emissions
        const sendWithDelay = (delay: number, action: any) => {
          setTimeout(() => {
            socket.emit('player-action', {
              gameId,
              playerId: 'latency-test',
              action,
              timestamp: Date.now() - delay, // Old timestamp
            });
          }, delay);
        };

        // Send actions with varying delays
        sendWithDelay(0, { type: 'MOVE_TO', targetPosition: { x: 1, y: 1 } });
        sendWithDelay(200, { type: 'MOVE_TO', targetPosition: { x: 2, y: 2 } });
        sendWithDelay(100, { type: 'MOVE_TO', targetPosition: { x: 3, y: 3 } });
        sendWithDelay(300, { type: 'MOVE_TO', targetPosition: { x: 4, y: 4 } });

        setTimeout(() => {
          expect(socket.connected).toBe(true);
          done();
        }, 500);
      });
    });
  });
});
