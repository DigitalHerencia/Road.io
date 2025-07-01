'use server';

import { db } from '../db';
import { organizations, userPreferences } from '../schema';
import { requirePermission, requireAuth } from '../rbac';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../audit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { CompanyProfile, UserPreferences } from '@/types/settings';

const companyProfileSchema = z.object({
  companyName: z.string().min(1),
  legalEntity: z.string().min(1),
  dotNumber: z.string().optional(),
  usdotStatus: z.string().optional(),
  ein: z.string().optional(),
  businessHoursOpen: z.string().optional(),
  businessHoursClose: z.string().optional(),
});

const userPreferencesSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  language: z.string().optional(),
  timeZone: z.string().optional(),
  dateFormat: z.string().optional(),
  theme: z.enum(['light', 'dark']).optional(),
  units: z.enum(['imperial', 'metric']).optional(),
  currency: z.string().optional(),
  numberFormat: z.string().optional(),
});

export async function updateCompanyProfileAction(formData: FormData) {
  const user = await requirePermission('org:admin:configure_company_settings');

  const raw = {
    companyName: formData.get('companyName'),
    legalEntity: formData.get('legalEntity'),
    dotNumber: formData.get('dotNumber'),
    usdotStatus: formData.get('usdotStatus'),
    ein: formData.get('ein'),
    businessHoursOpen: formData.get('businessHoursOpen'),
    businessHoursClose: formData.get('businessHoursClose'),
  };

  const parsed = companyProfileSchema.parse(raw);
  const profile: CompanyProfile = {
    companyName: parsed.companyName,
    legalEntity: parsed.legalEntity,
    dotNumber: parsed.dotNumber,
    usdotStatus: parsed.usdotStatus,
    ein: parsed.ein,
    businessHours: parsed.businessHoursOpen || parsed.businessHoursClose ? {
      default: {
        open: parsed.businessHoursOpen || '',
        close: parsed.businessHoursClose || '',
      }
    } : undefined,
  };

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const settings = {
    ...org?.settings,
    companyProfile: profile,
  } as Record<string, unknown>;

  await db
    .update(organizations)
    .set({ settings, updatedAt: new Date() })
    .where(eq(organizations.id, user.orgId));

  await createAuditLog({
    action: AUDIT_ACTIONS.ORG_SETTINGS_UPDATE,
    resource: AUDIT_RESOURCES.ORGANIZATION,
    resourceId: user.orgId.toString(),
    details: { updatedBy: user.id, profile },
  });
}

export async function updateUserPreferencesAction(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    displayName: formData.get('displayName') || undefined,
    avatarUrl: formData.get('avatarUrl') || undefined,
    language: formData.get('language') || undefined,
    timeZone: formData.get('timeZone') || undefined,
    dateFormat: formData.get('dateFormat') || undefined,
    theme: formData.get('theme') || undefined,
    units: formData.get('units') || undefined,
    currency: formData.get('currency') || undefined,
    numberFormat: formData.get('numberFormat') || undefined,
  };

  const prefs = userPreferencesSchema.parse(raw);

  const [existing] = await db
    .select({ id: userPreferences.id, preferences: userPreferences.preferences })
    .from(userPreferences)
    .where(eq(userPreferences.userId, parseInt(user.id)));

  const preferences: UserPreferences = { ...(existing?.preferences || {}), ...prefs };

  if (existing) {
    await db
      .update(userPreferences)
      .set({ preferences, updatedAt: new Date() })
      .where(eq(userPreferences.userId, parseInt(user.id)));
  } else {
    await db.insert(userPreferences).values({
      userId: parseInt(user.id),
      preferences,
    });
  }

  await createAuditLog({
    action: AUDIT_ACTIONS.USER_UPDATE,
    resource: AUDIT_RESOURCES.USER,
    resourceId: user.id,
    details: { preferences },
  });

  return { success: true };
}
