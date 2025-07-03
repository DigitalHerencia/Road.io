import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  varchar,
  jsonb,
  index,
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
export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "INACTIVE", 
  "SUSPENDED",
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
export const driverStatusEnum = pgEnum("driver_status", [
  "AVAILABLE",
  "ON_DUTY",
  "OFF_DUTY",
]);
export const driverMessageSenderEnum = pgEnum('driver_message_sender', [
  'DRIVER',
  'DISPATCH',
])
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
export const trainingStatusEnum = pgEnum('training_status', ['ASSIGNED', 'COMPLETED']);

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

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  baseRole: systemRoleEnum('base_role').default('MEMBER').notNull(),
  permissions: jsonb('permissions').default('[]').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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
  customRoleId: integer("custom_role_id").references(() => roles.id),
  status: userStatusEnum("status").default("ACTIVE").notNull(),
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
  licenseClass: varchar("license_class", { length: 5 }),
  endorsements: varchar("endorsements", { length: 255 }),
  licenseExpiry: timestamp("license_expiry"),
  dotNumber: varchar("dot_number", { length: 50 }),
  status: driverStatusEnum("status").default("AVAILABLE").notNull(),
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

export const userPreferencesIdx = index('user_prefs_user_id_idx').on(userPreferences.userId);

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
  expiresAt: timestamp("expires_at", { withTimezone: true }),
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

// Driver annual reviews
export const driverAnnualReviews = pgTable('driver_annual_reviews', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  reviewDate: timestamp('review_date').notNull(),
  isQualified: boolean('is_qualified').default(true).notNull(),
  notes: text('notes'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vehicle inspections
export const vehicleInspections = pgTable('vehicle_inspections', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  inspectorId: integer('inspector_id').references(() => users.id).notNull(),
  inspectionDate: timestamp('inspection_date').notNull(),
  passed: boolean('passed').default(true).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Vehicle maintenance records
export const vehicleMaintenance = pgTable('vehicle_maintenance', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  vehicleId: integer('vehicle_id').references(() => vehicles.id).notNull(),
  maintenanceDate: timestamp('maintenance_date').notNull(),
  mileage: integer('mileage'),
  vendor: varchar('vendor', { length: 100 }),
  description: text('description'),
  cost: integer('cost'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Accident reports
export const accidentReports = pgTable('accident_reports', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id),
  vehicleId: integer('vehicle_id').references(() => vehicles.id),
  occurredAt: timestamp('occurred_at').notNull(),
  description: text('description'),
  injuries: boolean('injuries').default(false).notNull(),
  fatalities: boolean('fatalities').default(false),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Training programs
export const trainingPrograms = pgTable('training_programs', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdById: integer('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Driver training records
export const driverTrainings = pgTable('driver_trainings', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  programId: integer('program_id').references(() => trainingPrograms.id).notNull(),
  status: trainingStatusEnum('status').default('ASSIGNED').notNull(),
  scheduledAt: timestamp('scheduled_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Driver license violations
export const driverViolations = pgTable('driver_violations', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Driver certifications (DOT medical, hazmat, etc.)
export const driverCertifications = pgTable('driver_certifications', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  issuedAt: timestamp('issued_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Driver benefits
export const driverBenefits = pgTable('driver_benefits', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Pay statements
export const payStatements = pgTable('pay_statements', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  miles: integer('miles').notNull(),
  ratePerMile: integer('rate_per_mile').notNull(),
  perDiem: integer('per_diem').default(0).notNull(),
  benefitsDeduction: integer('benefits_deduction').default(0).notNull(),
  grossPay: integer('gross_pay').notNull(),
  netPay: integer('net_pay').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Dispatch driver messages
export const dispatchMessages = pgTable('dispatch_messages', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id).notNull(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  emergency: boolean('emergency').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
});

// Customer notifications
export const customerNotifications = pgTable('customer_notifications', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  loadId: integer('load_id').references(() => loads.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).default('status').notNull(),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// IFTA audit responses
export const iftaAuditResponses = pgTable('ifta_audit_responses', {
  id: serial('id').primaryKey(),
  orgId: integer('org_id').references(() => organizations.id).notNull(),
  question: text('question').notNull(),
  response: text('response'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  driverAnnualReviews: many(driverAnnualReviews),
  vehicleInspections: many(vehicleInspections),
  vehicleMaintenance: many(vehicleMaintenance),
  accidentReports: many(accidentReports),
  trainingPrograms: many(trainingPrograms),
  driverTrainings: many(driverTrainings),
  driverBenefits: many(driverBenefits),
  driverViolations: many(driverViolations),
  driverCertifications: many(driverCertifications),
  payStatements: many(payStatements),
  driverMessages: many(driverMessages),
  iftaAuditResponses: many(iftaAuditResponses),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  customRole: one(roles, {
    fields: [users.customRoleId],
    references: [roles.id],
  }),
  driver: one(drivers),
  createdLoads: many(loads),
  auditLogs: many(auditLogs),
  uploadedDocuments: many(documents),
  vehicleInspections: many(vehicleInspections),
  maintenanceRecords: many(vehicleMaintenance),
  createdReviews: many(driverAnnualReviews),
  accidentReports: many(accidentReports),
  createdTrainingPrograms: many(trainingPrograms),
  payStatements: many(payStatements),
  iftaAuditResponses: many(iftaAuditResponses),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.orgId],
    references: [organizations.id],
  }),
  users: many(users),
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
  annualReviews: many(driverAnnualReviews),
  accidentReports: many(accidentReports),
  trainings: many(driverTrainings),
  benefits: many(driverBenefits),
  violations: many(driverViolations),
  certifications: many(driverCertifications),
  payStatements: many(payStatements),
  messages: many(driverMessages),
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
  inspections: many(vehicleInspections),
  maintenanceRecords: many(vehicleMaintenance),
  accidentReports: many(accidentReports),
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

export const iftaAuditResponsesRelations = relations(iftaAuditResponses, ({ one }) => ({
  organization: one(organizations, {
    fields: [iftaAuditResponses.orgId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [iftaAuditResponses.createdById],
    references: [users.id],
  }),
}));

export const dispatchMessagesRelations = relations(dispatchMessages, ({ one }) => ({
  organization: one(organizations, {
    fields: [dispatchMessages.orgId],
    references: [organizations.id],
  }),
  driver: one(drivers, {
    fields: [dispatchMessages.driverId],
    references: [drivers.id],
  }),
  sender: one(users, {
    fields: [dispatchMessages.senderId],
    references: [users.id],
  }),
}));

export const customerNotificationsRelations = relations(customerNotifications, ({ one }) => ({
  organization: one(organizations, {
    fields: [customerNotifications.orgId],
    references: [organizations.id],
  }),
  load: one(loads, {
    fields: [customerNotifications.loadId],
    references: [loads.id],
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
export type DriverAnnualReview = typeof driverAnnualReviews.$inferSelect;
export type NewDriverAnnualReview = typeof driverAnnualReviews.$inferInsert;
export type VehicleInspection = typeof vehicleInspections.$inferSelect;
export type NewVehicleInspection = typeof vehicleInspections.$inferInsert;
export type VehicleMaintenanceRecord = typeof vehicleMaintenance.$inferSelect;
export type NewVehicleMaintenanceRecord = typeof vehicleMaintenance.$inferInsert;
export type AccidentReport = typeof accidentReports.$inferSelect;
export type NewAccidentReport = typeof accidentReports.$inferInsert;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type NewTrainingProgram = typeof trainingPrograms.$inferInsert;
export type DriverTraining = typeof driverTrainings.$inferSelect;
export type NewDriverTraining = typeof driverTrainings.$inferInsert;
export type DriverBenefit = typeof driverBenefits.$inferSelect;
export type NewDriverBenefit = typeof driverBenefits.$inferInsert;
export type DriverViolation = typeof driverViolations.$inferSelect;
export type NewDriverViolation = typeof driverViolations.$inferInsert;
export type DriverCertification = typeof driverCertifications.$inferSelect;
export type NewDriverCertification = typeof driverCertifications.$inferInsert;
export type PayStatement = typeof payStatements.$inferSelect;
export type NewPayStatement = typeof payStatements.$inferInsert;
export type DispatchMessage = typeof dispatchMessages.$inferSelect;
export type NewDispatchMessage = typeof dispatchMessages.$inferInsert;
export type CustomerNotification = typeof customerNotifications.$inferSelect;
export type NewCustomerNotification = typeof customerNotifications.$inferInsert;
export type IftaAuditResponse = typeof iftaAuditResponses.$inferSelect;
export type NewIftaAuditResponse = typeof iftaAuditResponses.$inferInsert;
export type DriverMessage = typeof driverMessages.$inferSelect;
export type NewDriverMessage = typeof driverMessages.$inferInsert;

