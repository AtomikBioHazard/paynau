import db from './database';
import bcrypt from 'bcrypt';
import type { User, ServiceResult } from '@/types';

const SALT_ROUNDS = 10;

export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE');
  return stmt.get(username) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function createUser(username: string, password: string): ServiceResult<User> {
  const existing = getUserByUsername(username);
  if (existing) return { success: false, error: 'Username already exists' };
  
  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  
  const result = stmt.run(username, passwordHash);
  const user = getUserById(result.lastInsertRowid as number);
  
  if (!user) return { success: false, error: 'Failed to create user' };
  return { success: true, data: user };
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
