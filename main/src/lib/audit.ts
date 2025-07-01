import { db } from "./db";
import { auditLogs, type NewAuditLog } from "./schema";
import { getCurrentUser } from "./rbac";

export interface AuditLogData {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    const user = await getCurrentUser();

    const auditData: NewAuditLog = {
      orgId: user?.orgId || 0,
      userId: user ? parseInt(user.id) : undefined,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };

    await db.insert(auditLogs).values(auditData);
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error to prevent breaking the main operation
  }
}

/**
 * Audit log decorator for functions
 */
export function auditLog(action: string, resource: string) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<
      (...args: unknown[]) => Promise<unknown>
    >,
  ) {
    const method = descriptor.value!;

    descriptor.value = async function (...args: unknown[]) {
      const result = await method.apply(this, args);

      // Extract resource ID if it's the first argument or in the result
      const firstArg = args[0];
      const resultObj = result as Record<string, unknown> | null;

      let resourceId: string | undefined;
      if (typeof firstArg === "object" && firstArg && "id" in firstArg) {
        resourceId = String(firstArg.id);
      } else if (typeof firstArg === "string" || typeof firstArg === "number") {
        resourceId = String(firstArg);
      } else if (resultObj && "id" in resultObj) {
        resourceId = String(resultObj.id);
      }

      await createAuditLog({
        action,
        resource,
        resourceId,
        details: {
          args: args.length > 0 ? args[0] : undefined,
          result: typeof result === "object" ? { id: resultObj?.id } : result,
        },
      });

      return result;
    };

    return descriptor;
  };
}

/**
 * Common audit actions
 */
export const AUDIT_ACTIONS = {
  // User actions
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_CREATE: "user.create",
  USER_UPDATE: "user.update",
  USER_DELETE: "user.delete",
  USER_ROLE_CHANGE: "user.role_change",
  USER_INVITE: "user.invite",
  USER_WELCOME_EMAIL: "user.welcome_email",

  // Load actions
  LOAD_CREATE: "load.create",
  LOAD_UPDATE: "load.update",
  LOAD_DELETE: "load.delete",
  LOAD_ASSIGN: "load.assign",
  LOAD_STATUS_CHANGE: "load.status_change",

  // Driver actions
  DRIVER_CREATE: "driver.create",
  DRIVER_UPDATE: "driver.update",
  DRIVER_ASSIGN: "driver.assign",

  // Vehicle actions
  VEHICLE_CREATE: "vehicle.create",
  VEHICLE_UPDATE: "vehicle.update",
  VEHICLE_ASSIGN: "vehicle.assign",

  // Trip actions
  TRIP_CREATE: "trip.create",

  // Fuel actions
  FUEL_PURCHASE_CREATE: "fuel_purchase.create",
  FUEL_CARD_IMPORT: "fuel_card.import",

  // Document actions
  DOCUMENT_UPLOAD: "document.upload",
  DOCUMENT_REVIEW: "document.review",
  DOCUMENT_DELETE: "document.delete",

  // Organization actions
  ORG_SETTINGS_UPDATE: "organization.settings_update",
  ORG_BILLING_UPDATE: "organization.billing_update",

  // Compliance actions
  COMPLIANCE_REVIEW: "compliance.review",
  COMPLIANCE_REPORT_GENERATE: "compliance.report_generate",
} as const;

/**
 * Common audit resources
 */
export const AUDIT_RESOURCES = {
  USER: "user",
  LOAD: "load",
  DRIVER: "driver",
  VEHICLE: "vehicle",
  DOCUMENT: "document",
  ORGANIZATION: "organization",
  COMPLIANCE: "compliance",
  TRIP: "trip",
  FUEL_PURCHASE: "fuel_purchase",
} as const;
