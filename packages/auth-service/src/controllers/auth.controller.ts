import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await AuthService.registerUser({ username, email, password });
    return res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'USER_EXISTS') {
      return res.status(409).json({ error: 'User or email already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const authData = await AuthService.loginUser({ email, password });
    return res.json(authData);
  } catch (err: any) {
    if (err.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await AuthService.getAllUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
};