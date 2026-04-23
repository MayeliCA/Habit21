import type { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema';
import { config } from '../../config/env';
import { isValidTimezone, todayForTimezone } from '../../utils/date';
import type { AuthResponse } from '@shared/types/auth';

const TIMEZONE_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
  timezone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  timezone: z.string().optional(),
});

const timezoneSchema = z.object({
  timezone: z.string().min(1),
});

function signToken(userId: string, timezone: string): string {
  return jwt.sign({ userId, timezone }, config.JWT_SECRET, { expiresIn: '7d' });
}

function resolveTimezone(tz?: string): string {
  if (tz && isValidTimezone(tz)) return tz;
  return 'UTC';
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const tz = resolveTimezone(input.timezone);

  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const [user] = await db
    .insert(users)
    .values({ email: input.email, passwordHash, name: input.name, timezone: tz })
    .returning({ id: users.id, email: users.email, name: users.name, timezone: users.timezone });

  const token = signToken(user.id, user.timezone);
  const response: AuthResponse = { user, token };
  return res.status(201).json(response);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true, email: true, name: true, passwordHash: true, timezone: true },
  });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user.id, user.timezone);
  const response: AuthResponse = {
    user: { id: user.id, email: user.email, name: user.name, timezone: user.timezone },
    token,
  };
  return res.json(response);
}

export async function updateTimezone(req: Request, res: Response) {
  const input = timezoneSchema.parse(req.body);

  if (!isValidTimezone(input.timezone)) {
    return res.status(400).json({ error: 'Invalid timezone' });
  }

  const userId = req.user!.userId;
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { timezone: true, timezoneChangedAt: true },
  });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.timezone === input.timezone) {
    const token = signToken(userId, user.timezone);
    return res.json({
      user: { id: userId, email: '', name: '', timezone: user.timezone },
      token,
      today: todayForTimezone(user.timezone),
    });
  }

  if (
    user.timezoneChangedAt &&
    new Date().getTime() - new Date(user.timezoneChangedAt).getTime() < TIMEZONE_COOLDOWN_MS
  ) {
    return res.status(429).json({
      error: 'Timezone can only be changed once every 24 hours',
      timezone: user.timezone,
      today: todayForTimezone(user.timezone),
    });
  }

  await db
    .update(users)
    .set({ timezone: input.timezone, timezoneChangedAt: new Date() })
    .where(eq(users.id, userId));

  const token = signToken(userId, input.timezone);
  return res.json({
    user: { id: userId, email: '', name: '', timezone: input.timezone },
    token,
    today: todayForTimezone(input.timezone),
  });
}
