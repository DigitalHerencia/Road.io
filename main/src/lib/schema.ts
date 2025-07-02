import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  varchar,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const systemRoleEnum = pgEnum("system_role", [
  "ADMIN",
  "DISPATCHER",
  "DRIVER",
  "COMPLIANCE",
  "MEMBER",
]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "past_due",
  "trialing",
]);
export const loadStatusEnum = pgEnum("load_status", [
  "pending",
  "assigned",
  "in_transit",
  "delivered",
  "cancelled",
]);
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "ACTIVE",
  "MAINTENANCE",
  "RETIRED",
]);
export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "TRACTOR",
  "TRAILER",
  "VAN",
  "CAR",
  "OTHER",
]);
export const fuelPaymentMethodEnum = pgEnum("fuel_payment_method", [
  "CARD",
  "CASH",
  "OTHER",
]);
export const fuelTaxStatusEnum = pgEnum("fuel_tax_status", ["PAID", "FREE"]);

// Organizations table (multi-tenant)
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  clerkOrgId: varchar("clerk_org_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status")
    .default("trialing")
    .notNull(),
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default(
    "basic",
  ),
  maxUsers: serial("max_users").default(10),
  settings: jsonb("settings").default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table with multi-tenant support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  role: systemRoleEnum("role").default("MEMBER").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Drivers table (extends users)
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .references(() => users.id)
    .notNull(),
  licenseNumber: varchar("license_number", { length: 50 }),
  licenseExpiry: timestamp("license_expiry"),
  dotNumber: varchar("dot_number", { length: 50 }),
  isAvailable: boolean("is_available").default(true).notNull(),
  currentLocation: jsonb("current_location"), // { lat, lng, address }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  orgId: serial('org_id').references(() => organizations.id).notNull(),
  vin: varchar('vin', { length: 17 }).notNull(),
  licensePlate: varchar('license_plate', { length: 20 }),
  make: varchar('make', { length: 50 }),
  model: varchar('model', { length: 50 }),
  year: serial('year'),
  type: vehicleTypeEnum('type'),
  capacity: integer('capacity'),
  insuranceProvider: varchar('insurance_provider', { length: 100 }),
  insurancePolicyNumber: varchar('insurance_policy_number', { length: 100 }),
  ownerInfo: varchar('owner_info', { length: 255 }),
  photoUrl: text('photo_url'),
  nextMaintenanceDate: timestamp('next_maintenance_date'),
  nextInspectionDate: timestamp('next_inspection_date'),
  status: vehicleStatusEnum('status').default('ACTIVE').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  currentDriverId: serial("current_driver_id").references(() => drivers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Loads table
export const loads = pgTable("loads", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  loadNumber: varchar("load_number", { length: 50 }).notNull(),
  status: loadStatusEnum("status").default("pending").notNull(),
  assignedDriverId: serial("assigned_driver_id").references(() => drivers.id),
  assignedVehicleId: serial("assigned_vehicle_id").references(
    () => vehicles.id,
  ),
  pickupLocation: jsonb("pickup_location").notNull(), // { address, lat, lng, datetime }
  deliveryLocation: jsonb("delivery_location").notNull(), // { address, lat, lng, datetime }
  weight: serial("weight"), // in pounds
  distance: serial("distance"), // in miles
  rate: serial("rate"), // in cents
  notes: text("notes"),
  createdById: serial("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  userId: serial("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 50 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User invitations table
export const userInvitations = pgTable("user_invitations", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: systemRoleEnum("role").default("MEMBER").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  preferences: jsonb('preferences').default('{}').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  uploadedById: serial("uploaded_by_id")
    .references(() => users.id)
    .notNull(),
  loadId: serial("load_id").references(() => loads.id),
  driverId: serial("driver_id").references(() => drivers.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: serial("file_size"), // in bytes
  documentType: varchar("document_type", { length: 50 }), // 'pod', 'invoice', 'license', etc.
  isCompliant: boolean("is_compliant").default(false),
  reviewedById: serial("reviewed_by_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fuel purchases table
export const fuelPurchases = pgTable("fuel_purchases", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  driverId: serial("driver_id")
    .references(() => drivers.id)
    .notNull(),
  vehicleId: serial("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  quantity: integer("quantity"), // gallons
  pricePerUnit: integer("price_per_unit"), // cents
  totalCost: integer("total_cost"), // cents
  vendor: varchar("vendor", { length: 255 }),
  state: varchar("state", { length: 2 }),
  taxStatus: fuelTaxStatusEnum("tax_status").default("PAID").notNull(),
  paymentMethod: fuelPaymentMethodEnum("payment_method")
    .default("CARD")
    .notNull(),
  receiptUrl: text("receipt_url"),
  createdById: serial("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trips table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  driverId: serial("driver_id").references(() => drivers.id),
  vehicleId: serial("vehicle_id").references(() => vehicles.id),
  loadId: serial("load_id").references(() => loads.id),
  startLocation: jsonb("start_location").notNull(), // { lat, lng, state }
  endLocation: jsonb("end_location").notNull(), // { lat, lng, state }
  distance: serial("distance"), // in miles
  jurisdictions: jsonb("jurisdictions").default("[]"), // [{state, miles}]
  isInterstate: boolean("is_interstate").default(false),
  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at").notNull(),
  createdById: serial("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// IFTA tax rates
export const iftaTaxRates = pgTable("ifta_tax_rates", {
  id: serial("id").primaryKey(),
  state: varchar("state", { length: 2 }).notNull(),
  quarter: varchar("quarter", { length: 7 }).notNull(), // e.g. 2024Q1
  rate: integer("rate").notNull(), // cents per gallon
  effectiveDate: timestamp("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// IFTA reports
export const iftaReports = pgTable("ifta_reports", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id")
    .references(() => organizations.id)
    .notNull(),
  quarter: varchar("quarter", { length: 7 }).notNull(),
  totalTax: integer("total_tax").notNull(),
  interest: integer("interest").default(0).notNull(),
  pdfUrl: text("pdf_url").notNull(),
  createdById: serial("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Hours of Service enums
export const hosStatusEnum = pgEnum("hos_status", [
  "OFF_DUTY",
  "SLEEPER",
  "DRIVING",
  "ON_DUTY",
]);
export const hosSourceEnum = pgEnum("hos_source", ["MANUAL", "ELD"]);
export const hosViolationTypeEnum = pgEnum("hos_violation_type", [
  "MAX_DRIVE",
  "SHIFT_LIMIT",
  "CYCLE_LIMIT",
]);

// HOS logs table
export const hosLogs = pgTable("hos_logs", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  driverId: serial("driver_id")
    .references(() => drivers.id)
    .notNull(),
  status: hosStatusEnum("status").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: jsonb("location"), // { lat, lng, address }
  notes: text("notes"),
  source: hosSourceEnum("source").default("MANUAL").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// HOS violations table
export const hosViolations = pgTable("hos_violations", {
  id: serial("id").primaryKey(),
  orgId: serial("org_id")
    .references(() => organizations.id)
    .notNull(),
  driverId: serial("driver_id")
    .references(() => drivers.id)
    .notNull(),
  logId: serial("log_id").references(() => hosLogs.id),
  type: hosViolationTypeEnum("type").notNull(),
  message: text("message").notNull(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  vehicles: many(vehicles),
  loads: many(loads),
  auditLogs: many(auditLogs),
  documents: many(documents),
  trips: many(trips),
  fuelPurchases: many(fuelPurchases),
  hosLogs: many(hosLogs),
  hosViolations: many(hosViolations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  driver: one(drivers),
  createdLoads: many(loads),
  auditLogs: many(auditLogs),
  uploadedDocuments: many(documents),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  currentVehicle: one(vehicles),
  assignedLoads: many(loads),
  documents: many(documents),
  trips: many(trips),
  fuelPurchases: many(fuelPurchases),
  hosLogs: many(hosLogs),
  hosViolations: many(hosViolations),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [vehicles.orgId],
    references: [organizations.id],
  }),
  currentDriver: one(drivers, {
    fields: [vehicles.currentDriverId],
    references: [drivers.id],
  }),
  assignedLoads: many(loads),
  trips: many(trips),
  fuelPurchases: many(fuelPurchases),
}));

export const loadsRelations = relations(loads, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [loads.orgId],
    references: [organizations.id],
  }),
  assignedDriver: one(drivers, {
    fields: [loads.assignedDriverId],
    references: [drivers.id],
  }),
  assignedVehicle: one(vehicles, {
    fields: [loads.assignedVehicleId],
    references: [vehicles.id],
  }),
  createdBy: one(users, {
    fields: [loads.createdById],
    references: [users.id],
  }),
  documents: many(documents),
  trips: many(trips),
}));

export const hosLogsRelations = relations(hosLogs, ({ one, many }) => ({
  driver: one(drivers, {
    fields: [hosLogs.driverId],
    references: [drivers.id],
  }),
  organization: one(organizations, {
    fields: [hosLogs.orgId],
    references: [organizations.id],
  }),
  violations: many(hosViolations),
}));

export const hosViolationsRelations = relations(hosViolations, ({ one }) => ({
  log: one(hosLogs, {
    fields: [hosViolations.logId],
    references: [hosLogs.id],
  }),
  driver: one(drivers, {
    fields: [hosViolations.driverId],
    references: [drivers.id],
  }),
  organization: one(organizations, {
    fields: [hosViolations.orgId],
    references: [organizations.id],
  }),
}));

export const iftaReportsRelations = relations(iftaReports, ({ one }) => ({
  organization: one(organizations, {
    fields: [iftaReports.orgId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [iftaReports.createdById],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  organization: one(organizations, {
    fields: [documents.orgId],
    references: [organizations.id],
  }),
  uploadedBy: one(users, {
    fields: [documents.uploadedById],
    references: [users.id],
  }),
  load: one(loads, {
    fields: [documents.loadId],
    references: [loads.id],
  }),
  driver: one(drivers, {
    fields: [documents.driverId],
    references: [drivers.id],
  }),
  reviewedBy: one(users, {
    fields: [documents.reviewedById],
    references: [users.id],
  }),
}));

export const userInvitationsRelations = relations(
  userInvitations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [userInvitations.orgId],
      references: [organizations.id],
    }),
  }),
);

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// Export types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Load = typeof loads.$inferSelect;
export type NewLoad = typeof loads.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type FuelPurchase = typeof fuelPurchases.$inferSelect;
export type NewFuelPurchase = typeof fuelPurchases.$inferInsert;
export type UserInvitation = typeof userInvitations.$inferSelect;
export type NewUserInvitation = typeof userInvitations.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type HosLog = typeof hosLogs.$inferSelect;
export type NewHosLog = typeof hosLogs.$inferInsert;
export type HosViolation = typeof hosViolations.$inferSelect;
export type NewHosViolation = typeof hosViolations.$inferInsert;
export type IftaTaxRate = typeof iftaTaxRates.$inferSelect;
export type NewIftaTaxRate = typeof iftaTaxRates.$inferInsert;
export type IftaReport = typeof iftaReports.$inferSelect;
export type NewIftaReport = typeof iftaReports.$inferInsert;
