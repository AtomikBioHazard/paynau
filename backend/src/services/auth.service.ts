import * as userModel from '@/models/user.model';
import jwt from 'jsonwebtoken';
import type { User, AuthPayload, ServiceResult } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

export interface LoginResult {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export function login(username: string, password: string): ServiceResult<LoginResult> {
  if (!username?.trim()) return { success: false, error: 'Username is required' };
  if (!password) return { success: false, error: 'Password is required' };
  
  const user = userModel.getUserByUsername(username);
  if (!user) return { success: false, error: 'Invalid credentials' };
  
  const isValid = userModel.verifyPassword(password, user.password_hash);
  if (!isValid) return { success: false, error: 'Invalid credentials' };
  
  const payload: AuthPayload = { userId: user.id, username: user.username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  const { password_hash, ...userWithoutPassword } = user;
  return { success: true, data: { user: userWithoutPassword, token } };
}

export function register(username: string, password: string): ServiceResult<LoginResult> {
  if (!username?.trim() || username.length < 3) 
    return { success: false, error: 'Username must be at least 3 characters' };
  if (!password || password.length < 6) 
    return { success: false, error: 'Password must be at least 6 characters' };
  
  const createResult = userModel.createUser(username, password);
  if (!createResult.success) return createResult;
  
  return login(username, password);
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}
