import { describe, it, expect, beforeEach, beforeAll, afterAll, jest,afterEach } from '@jest/globals';
import http from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import initSocketServer from '../socketServer';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

describe('Presence Handler Tests', () => {
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
  });

  it('should broadcast "user_online" when a user connects', (done) => {
    client1 = Client(`http://localhost:${port}`, {
      auth: { token: user1Token },
      transports: ['websocket'],
    });

    client1.on('user_online', (data) => {
      expect(data.userId).toBe('user-1');
      expect(data.onlineUsers).toContain('user-1');
      expect(data.presences['user-1']).toEqual({ status: 'Available' });
      done();
    });
  });

  it('should respond to "get_online_users" with online list and presence map', (done) => {
    client1 = Client(`http://localhost:${port}`, {
      auth: { token: user1Token },
      transports: ['websocket'],
    });

    client1.on('connect', () => {
      client1.emit('get_online_users');
    });

    let receivedList = false;
    let receivedPresences = false;

    client1.on('online_users_list', (onlineUsers) => {
      expect(onlineUsers).toContain('user-1');
      receivedList = true;
      if (receivedList && receivedPresences) done();
    });

    client1.on('get_all_presences', (presences) => {
      expect(presences['user-1']).toBeDefined();
      receivedPresences = true;
      if (receivedList && receivedPresences) done();
    });
  });

  it('should broadcast "presence_changed" when status is updated', (done) => {
    client1 = Client(`http://localhost:${port}`, {
      auth: { token: user1Token },
      transports: ['websocket'],
    });

    client1.on('connect', () => {
      client1.emit('update_presence', { status: 'Away', customNote: 'BRB' });
    });

    client1.on('presence_changed', (data) => {
      expect(data.userId).toBe('user-1');
      expect(data.status).toBe('Away');
      expect(data.customNote).toBe('BRB');
      done();
    });
  });

  it('should broadcast "user_offline" when a user disconnects', (done) => {
    client1 = Client(`http://localhost:${port}`, {
      auth: { token: user1Token },
      transports: ['websocket'],
    });

    client1.on('connect', () => {
      // Connect second client to receive disconnection broadcast
      client2 = Client(`http://localhost:${port}`, {
        auth: { token: user2Token },
        transports: ['websocket'],
      });

      client2.on('connect', () => {
        client1.disconnect();
      });

      client2.on('user_offline', (data) => {
        expect(data.userId).toBe('user-1');
        done();
      });
    });
  });
});