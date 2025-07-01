import { db } from '../db';
import { organizations, userPreferences } from '../schema';
import { getCurrentUser } from '../rbac';
import { eq } from 'drizzle-orm';
import type { CompanyProfile } from '@/types/settings';
import type { UserPreferences } from '@/types/settings';

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const profile = org?.settings?.companyProfile as CompanyProfile | undefined;
  return profile ?? null;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const [pref] = await db
    .select({ preferences: userPreferences.preferences })
    .from(userPreferences)
    .where(eq(userPreferences.userId, user.id));

  return (pref?.preferences as UserPreferences) ?? null;
}
