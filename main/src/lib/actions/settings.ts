'use server';

import { db } from '../db';
import { organizations, userPreferences } from '../schema';
import { promises as fs } from 'fs';
import path from 'path';
import { requirePermission, requireAuth } from '../rbac';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../audit';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type {
  CompanyProfile,
  UserPreferences,
  SystemConfig,
  IntegrationSettings,
  NotificationSettings,
} from '@/types/settings';

const companyProfileSchema = z.object({
  companyName: z.string().min(1),
  legalEntity: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  operatingAuthority: z.string().optional(),
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

const systemConfigSchema = z.object({
  maintenanceEnabled: z.coerce.boolean().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

const integrationSettingsSchema = z.object({
  eldApiKey: z.string().optional(),
  fuelCardProvider: z.string().optional(),
  mappingApiKey: z.string().optional(),
  commsWebhookUrl: z.string().url().optional(),
  paymentProcessorKey: z.string().optional(),
});

const notificationSettingsSchema = z.object({
  emailEnabled: z.coerce.boolean().optional(),
  smsEnabled: z.coerce.boolean().optional(),
  pushEnabled: z.coerce.boolean().optional(),
  escalationEmail: z.string().email().optional(),
});

export async function updateCompanyProfileAction(formData: FormData) {
  const user = await requirePermission('org:admin:configure_company_settings');

  const raw = {
    companyName: formData.get('companyName'),
    legalEntity: formData.get('legalEntity'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    dotNumber: formData.get('dotNumber'),
    mcNumber: formData.get('mcNumber'),
    operatingAuthority: formData.get('operatingAuthority'),
    usdotStatus: formData.get('usdotStatus'),
    ein: formData.get('ein'),
    businessHoursOpen: formData.get('businessHoursOpen'),
    businessHoursClose: formData.get('businessHoursClose'),
  };

  const parsed = companyProfileSchema.parse(raw);
  const file = formData.get('logo');

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const existingProfile = (org?.settings as Record<string, unknown> | undefined)?.companyProfile as CompanyProfile | undefined;

  let logoUrl: string | undefined = existingProfile?.logoUrl;
  if (file instanceof File && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}${path.extname(file.name)}`;
const UPLOADS_DIR = path.join(process.cwd(), 'main', 'public', 'uploads');

    const uploadDir = UPLOADS_DIR;
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, unique), buffer);
    logoUrl = `/uploads/${unique}`;
  }

  const profile: CompanyProfile = {
    ...existingProfile,
    companyName: parsed.companyName,
    legalEntity: parsed.legalEntity,
    email: parsed.email ?? existingProfile?.email,
    phone: parsed.phone ?? existingProfile?.phone,
    address: parsed.address ?? existingProfile?.address,
    dotNumber: parsed.dotNumber ?? existingProfile?.dotNumber,
    mcNumber: parsed.mcNumber ?? existingProfile?.mcNumber,
    operatingAuthority: parsed.operatingAuthority ?? existingProfile?.operatingAuthority,
    usdotStatus: parsed.usdotStatus ?? existingProfile?.usdotStatus,
    ein: parsed.ein ?? existingProfile?.ein,
    businessHours: parsed.businessHoursOpen || parsed.businessHoursClose
      ? { default: { open: parsed.businessHoursOpen || '', close: parsed.businessHoursClose || '' } }
      : existingProfile?.businessHours,
    logoUrl,
  };

  const settings = {
    ...(org?.settings ?? {}),
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

  // Return nothing for form action compatibility
}

export async function updateSystemConfigAction(formData: FormData) {
  const user = await requirePermission('org:admin:configure_company_settings');

  const raw = {
    maintenanceEnabled: formData.get('maintenanceEnabled'),
    backupFrequency: formData.get('backupFrequency'),
  };

  const parsed = systemConfigSchema.parse(raw);

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const systemConfig: SystemConfig = {
    maintenance: { enabled: parsed.maintenanceEnabled ?? false },
    backup: {
      frequency: parsed.backupFrequency ?? 'weekly',
      retentionDays: 30,
    },
  };

  const settings = {
    ...(org?.settings ?? {}),
    systemConfig,
  } as Record<string, unknown>;

  await db
    .update(organizations)
    .set({ settings, updatedAt: new Date() })
    .where(eq(organizations.id, user.orgId));

  await createAuditLog({
    action: AUDIT_ACTIONS.ORG_SETTINGS_UPDATE,
    resource: AUDIT_RESOURCES.ORGANIZATION,
    resourceId: user.orgId.toString(),
    details: { updatedBy: user.id, systemConfig },
  });

  revalidatePath('/dashboard/settings/system');
  // Return nothing for form action compatibility
}

export async function updateIntegrationSettingsAction(formData: FormData) {
  const user = await requirePermission('org:admin:configure_company_settings');

  const raw = {
    eldApiKey: formData.get('eldApiKey') || undefined,
    fuelCardProvider: formData.get('fuelCardProvider') || undefined,
    mappingApiKey: formData.get('mappingApiKey') || undefined,
    commsWebhookUrl: formData.get('commsWebhookUrl') || undefined,
    paymentProcessorKey: formData.get('paymentProcessorKey') || undefined,
  };

  const parsed = integrationSettingsSchema.parse(raw);

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const currentSettings = (org?.settings as Record<string, any>) ?? {};
  const integrationSettings: IntegrationSettings = {
    ...(currentSettings.integrationSettings ?? {}),
    ...parsed,
  };

  const settings = {
    ...currentSettings,
    integrationSettings,
  } as Record<string, unknown>;

  await db
    .update(organizations)
    .set({ settings, updatedAt: new Date() })
    .where(eq(organizations.id, user.orgId));

  await createAuditLog({
    action: AUDIT_ACTIONS.ORG_SETTINGS_UPDATE,
    resource: AUDIT_RESOURCES.ORGANIZATION,
    resourceId: user.orgId.toString(),
    details: { updatedBy: user.id, integrationSettings },
  });

  revalidatePath('/dashboard/settings/integrations');
  // Return nothing for form action compatibility
}

export async function updateNotificationSettingsAction(formData: FormData) {
  const user = await requirePermission('org:admin:configure_company_settings');

  const raw = {
    emailEnabled: formData.get('emailEnabled'),
    smsEnabled: formData.get('smsEnabled'),
    pushEnabled: formData.get('pushEnabled'),
    escalationEmail: formData.get('escalationEmail') || undefined,
  };

  const parsed = notificationSettingsSchema.parse(raw);

  const [org] = await db
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, user.orgId));

  const currentSettings = (org?.settings as Record<string, any>) ?? {};
  const notificationSettings: NotificationSettings = {
    ...(currentSettings.notificationSettings ?? {}),
    emailEnabled: parsed.emailEnabled ?? false,
    smsEnabled: parsed.smsEnabled ?? false,
    pushEnabled: parsed.pushEnabled ?? false,
    escalationEmail: parsed.escalationEmail ?? currentSettings.notificationSettings?.escalationEmail,
  };

  const settings = {
    ...currentSettings,
    notificationSettings,
  } as Record<string, unknown>;

  await db
    .update(organizations)
    .set({ settings, updatedAt: new Date() })
    .where(eq(organizations.id, user.orgId));

  await createAuditLog({
    action: AUDIT_ACTIONS.ORG_SETTINGS_UPDATE,
    resource: AUDIT_RESOURCES.ORGANIZATION,
    resourceId: user.orgId.toString(),
    details: { updatedBy: user.id, notificationSettings },
  });

  revalidatePath('/dashboard/settings/notifications');
  // Return nothing for form action compatibility
}
