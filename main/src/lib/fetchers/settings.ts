import { db } from '../db';
import { organizations } from '../schema';
import { getCurrentUser } from '../rbac';
import { eq } from 'drizzle-orm';
import type { CompanyProfile } from '@/types/settings';

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
