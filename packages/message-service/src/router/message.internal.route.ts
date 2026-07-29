import { Router } from 'express';
import { Server } from 'socket.io';
import { notifyUserCreated, notifyUserUpdated } from '../controllers/message.internal.controller';

export const createInternalRouter = (io: Server) => {
    const router = Router();

    router.post('/user-created', notifyUserCreated(io));
    router.patch('/user-updated', notifyUserUpdated(io));

    return router;
};