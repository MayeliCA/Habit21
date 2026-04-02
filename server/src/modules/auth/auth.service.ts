import type { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';
import { config } from '../../config/env';
import type { AuthResponse } from '@shared/types/auth';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(userId: string): string {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);

  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const [user] = await db
    .insert(users)
    .values({ email: input.email, passwordHash, name: input.name })
    .returning({ id: users.id, email: users.email, name: users.name });

  const token = signToken(user.id);
  const response: AuthResponse = { user, token };
  return res.status(201).json(response);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true, email: true, name: true, passwordHash: true },
  });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user.id);
  const response: AuthResponse = {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  };
  return res.json(response);
}
