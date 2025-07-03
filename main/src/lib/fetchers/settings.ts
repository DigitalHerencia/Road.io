import { db } from '../db';
import { organizations, userPreferences } from '../schema';
import { getCurrentUser } from '../rbac';
import { getCache, setCache } from '../cache';
import { decryptString } from '../encryption';
import { eq } from 'drizzle-orm';
import type {
  CompanyProfile,
  UserPreferences,
  SystemConfig,
  IntegrationSettings,
  NotificationSettings,
  WorkflowAutomationSettings,
  SecuritySettings,
  MobileSettings,
  AnalyticsSettings,
} from '@/features/settings/types';

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cacheKey = `companyProfile:${user.orgId}`;
  const cached = getCache<CompanyProfile | null>(cacheKey);
  if (cached) return cached;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  const profile = settings?.companyProfile as CompanyProfile | undefined;
  const result = profile ?? null;
  setCache(cacheKey, result);
  return result;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cacheKey = `userPrefs:${user.id}`;
  const cached = getCache<UserPreferences | null>(cacheKey);
  if (cached) return cached;

  const [pref] = await db
    .select({ preferences: userPreferences.preferences })
    .from(userPreferences)
    .where(eq(userPreferences.userId, parseInt(user.id)));

  const result = (pref?.preferences as UserPreferences) ?? null;
  setCache(cacheKey, result);
  return result;
}

export async function getSystemConfig(): Promise<SystemConfig | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cacheKey = `systemConfig:${user.orgId}`;
  const cached = getCache<SystemConfig | null>(cacheKey);
  if (cached) return cached;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  const config = settings?.systemConfig as SystemConfig | undefined;
  const result = config ?? null;
  setCache(cacheKey, result);
  return result;
}

export async function getIntegrationSettings(): Promise<IntegrationSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cacheKey = `integrationSettings:${user.orgId}`;
  const cached = getCache<IntegrationSettings | null>(cacheKey);
  if (cached) return cached;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  const integrations = settings?.integrationSettings as IntegrationSettings | undefined;
  const result = integrations
    ? {
        ...integrations,
        ...decryptFields(integrations, [
          'eldApiKey',
          'mappingApiKey',
          'commsWebhookUrl',
          'paymentProcessorKey',
        ]),
      }
    : null;
  setCache(cacheKey, result);
  return result;
}

export async function getNotificationSettings(): Promise<NotificationSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cacheKey = `notificationSettings:${user.orgId}`;
  const cached = getCache<NotificationSettings | null>(cacheKey);
  if (cached) return cached;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = org?.settings as Record<string, unknown> | undefined;
  const notifications = settings?.notificationSettings as NotificationSettings | undefined;
  const result = notifications ?? null;
  setCache(cacheKey, result);
  return result;
}

export async function getWorkflowAutomationSettings(): Promise<
  WorkflowAutomationSettings | null
> {
  const user = await getCurrentUser();
  if (!user) return null;
  const cacheKey = `workflowSettings:${user.orgId}`;
  const cached = getCache<WorkflowAutomationSettings | null>(cacheKey);
  if (cached) return cached;
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));
  const settings = org?.settings as Record<string, unknown> | undefined;
  const workflow = settings?.workflowAutomation as WorkflowAutomationSettings | undefined;
  const result = workflow ?? null;
  setCache(cacheKey, result);
  return result;
}

export async function getSecuritySettings(): Promise<SecuritySettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const cacheKey = `securitySettings:${user.orgId}`;
  const cached = getCache<SecuritySettings | null>(cacheKey);
  if (cached) return cached;
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));
  const settings = org?.settings as Record<string, unknown> | undefined;
  const security = settings?.securitySettings as SecuritySettings | undefined;
  const result = security ?? null;
  setCache(cacheKey, result);
  return result;
}

export async function getMobileSettings(): Promise<MobileSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const cacheKey = `mobileSettings:${user.orgId}`;
  const cached = getCache<MobileSettings | null>(cacheKey);
  if (cached) return cached;
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));
  const settings = org?.settings as Record<string, unknown> | undefined;
  const mobile = settings?.mobileSettings as MobileSettings | undefined;
  const result = mobile ?? null;
  setCache(cacheKey, result);
  return result;
}

export async function getAnalyticsSettings(): Promise<AnalyticsSettings | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const cacheKey = `analyticsSettings:${user.orgId}`;
  const cached = getCache<AnalyticsSettings | null>(cacheKey);
  if (cached) return cached;
  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));
  const settings = org?.settings as Record<string, unknown> | undefined;
  const analytics = settings?.analyticsSettings as AnalyticsSettings | undefined;
  const result = analytics ?? null;
  setCache(cacheKey, result);
  return result;
}
