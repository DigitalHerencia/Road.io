import { db } from '../db';
import { organizations, userPreferences } from '../schema';
import { getCurrentUser } from '../rbac';
import { eq } from 'drizzle-orm';
import type {
  CompanyProfile,
  UserPreferences,
  SystemConfig,
  IntegrationSettings,
  NotificationSettings,
} from '@/types/settings';

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  // Explicitly type settings as Record<string, unknown>
  const settings = org?.settings as Record<string, unknown> | undefined;
  const profile = settings?.companyProfile as CompanyProfile | undefined;
  return profile ?? null;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [pref] = await db
    .select({ preferences: userPreferences.preferences })
    .from(userPreferences)
    .where(eq(userPreferences.userId, parseInt(user.id)));

  return (pref?.preferences as UserPreferences) ?? null;
}

export async function getSystemConfig(): Promise<SystemConfig | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  const config = settings?.systemConfig as SystemConfig | undefined;
  return config ?? null;
}

export async function getIntegrationSettings(): Promise<IntegrationSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  const integrations = settings?.integrationSettings as IntegrationSettings | undefined;
  return integrations ?? null;
}

export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  const notifications = settings?.notificationSettings as NotificationSettings | undefined;
  return notifications ?? null;
}
