import { describe, it, expect, beforeEach, beforeAll, afterAll, jest , afterEach } from '@jest/globals';
import http from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import initSocketServer from '../socketServer';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Message Handler Tests', () => {
  let httpServer: http.Server;
  let port: number;
  let user1Token: string;
  let user2Token: string;
  let client1: ClientSocket;
  let client2: ClientSocket;

  beforeAll((done) => {
    user1Token = jwt.sign({ id: 'user-1', username: 'User One' }, JWT_SECRET);
    user2Token = jwt.sign({ id: 'user-2', username: 'User Two' }, JWT_SECRET);

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    httpServer = http.createServer();
    initSocketServer(httpServer);

    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    jest.restoreAllMocks();
    httpServer.close(done);
  });

  afterEach(() => {
    if (client1?.connected) client1.disconnect();
    if (client2?.connected) client2.disconnect();
    jest.restoreAllMocks();
  });

  it('should post message to HTTP endpoint and emit "receive_message" to sender & receiver', (done) => {
    const mockSavedMessage = {
      id: 'msg-123',
      senderId: 'user-1',
      receiverId: 'user-2',
      conversationId: 'user-1_user-2',
      content: 'Hey there!',
      createdAt: new Date().toISOString(),
    };

    // Mock global fetch for message-service HTTP endpoint
    global.fetch = jest.fn<any>().mockResolvedValue({
      json: async () => mockSavedMessage,
    });

    client1 = Client(`http://localhost:${port}`, {
      auth: { token: user1Token },
      transports: ['websocket'],
    });

    client2 = Client(`http://localhost:${port}`, {
      auth: { token: user2Token },
      transports: ['websocket'],
    });

    let client1Received = false;
    let client2Received = false;

    const checkDone = () => {
      if (client1Received && client2Received) {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:4003/api/messages',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: `Bearer ${user1Token}`,
            }),
          })
        );
        done();
      }
    };

    client2.on('connect', () => {
      client1.emit('send_message', { receiverId: 'user-2', content: 'Hey there!' });
    });

    client1.on('receive_message', (payload) => {
      expect(payload.content).toBe('Hey there!');
      client1Received = true;
      checkDone();
    });

    client2.on('receive_message', (payload) => {
      expect(payload.content).toBe('Hey there!');
      client2Received = true;
      checkDone();
    });
  });

  it('should ignore "send_message" if content or receiverId is empty', (done) => {
    global.fetch = jest.fn<any>();

    client1 = Client(`http://localhost:${port}`, {
      auth: { token: user1Token },
      transports: ['websocket'],
    });

    client1.on('connect', () => {
      client1.emit('send_message', { receiverId: 'user-2', content: '' });

      setTimeout(() => {
        expect(global.fetch).not.toHaveBeenCalled();
        done();
      }, 300);
    });
  });

  it('should notify the original sender when "mark_as_read" is emitted', (done) => {
    client1 = Client(`http://localhost:${port}`, {
      auth: { token: user1Token },
      transports: ['websocket'],
    });

    client2 = Client(`http://localhost:${port}`, {
      auth: { token: user2Token },
      transports: ['websocket'],
    });

    client2.on('connect', () => {
      client2.emit('mark_as_read', { senderId: 'user-1' });
    });

    client1.on('messages_read', (data) => {
      expect(data.readByUserId).toBe('user-2');
      done();
    });
  });
});