import type { Request, Response } from 'express';
import * as authService from '@/services/auth.service';

export function login(req: Request, res: Response): void {
  const { username, password } = req.body;
  const result = authService.login(username, password);
  
  if (!result.success) {
    res.status(401).json(result);
    return;
  }
  
  res.json(result);
}

export function register(req: Request, res: Response): void {
  const { username, password } = req.body;
  const result = authService.register(username, password);
  
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  
  res.status(201).json(result);
}
