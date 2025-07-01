'use server';

import { db } from '../db';
import { organizations } from '../schema';
import { requirePermission } from '../rbac';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '../audit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { CompanyProfile } from '@/types/settings';

const companyProfileSchema = z.object({
  companyName: z.string().min(1),
  legalEntity: z.string().min(1),
  dotNumber: z.string().optional(),
  usdotStatus: z.string().optional(),
  ein: z.string().optional(),
  businessHoursOpen: z.string().optional(),
  businessHoursClose: z.string().optional(),
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
