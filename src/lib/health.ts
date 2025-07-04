import { db } from './db';

export interface HealthStatus {
  database: boolean;
  uptime: number;
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    await db.execute('SELECT 1');
    return { database: true, uptime: process.uptime() };
  } catch {
    return { database: false, uptime: process.uptime() };
  }
}
