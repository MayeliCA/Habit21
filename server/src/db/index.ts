import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { config } from '../config/env';

const client = postgres(config.DATABASE_URL);
export const db = drizzle(client, { schema });
