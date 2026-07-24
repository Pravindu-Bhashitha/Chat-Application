import { Request, Response } from 'express';
import { getAllUsers, loginUser, registerUser } from '../services/auth.service';
import { AppError } from '../utils/AppError';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required',statusCode: 400 });
    }

    const user = await registerUser({ username, email, password });
    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Internal server error', statusCode: 500 });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login request received:', { email, password });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required', statusCode: 400 });
    }

    const authData = await loginUser({ email, password });

    return res.json(authData);
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Internal server error', statusCode: 500 });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message, statusCode: error.statusCode });
    }
    return res.status(500).json({ error: 'Failed to fetch users', statusCode: 500 });
  }
};