# Road.io Feature Architecture

This page outlines the feature-driven architecture for Road.io, a modern multi-tenant SaaS fleet management platform.  
**Optimized for LLM agents and contributors.**

## Principles

- **Feature-Driven Structure:** Each domain is a feature module.
- **Server-First Rendering:** Next.js 15 App Router, React Server Components.
- **Multi-Tenant RBAC:** Role-based access, org-level isolation.
- **Audit Logging:** Comprehensive activity tracking.
- **Type Safety:** TypeScript + Zod validation.
- **Modern UI:** shadcn/ui + Tailwind CSS.
- **Database-First:** Drizzle ORM + Neon Postgres.

## Directory Structure

```
src/
├── features/        # Feature modules (admin, dispatch, vehicles, etc.)
├── lib/             # Fetchers, actions, schema, RBAC, audit, db
├── app/             # Next.js App Router, dashboards, API routes
└── components/      # UI, shared, layout
```

## Feature Modules

- **Admin:** User/org management, audit logs, billing.
- **Dispatch:** Load management, assignments, tracking.
- **Vehicles:** Fleet, maintenance, docs.
- **Drivers:** Profiles, licensing, HOS.
- **Compliance:** Docs, expiration, audit prep.
- **IFTA:** Fuel tax reporting.
- **Analytics:** Dashboards, KPIs, reporting.
- **Settings:** Company/user/system config.

## Data Layer

- **Fetchers:** `/lib/fetchers` — RBAC, caching, error handling, multi-tenant.
- **Server Actions:** `/lib/actions` — Zod validation, RBAC, audit, error handling.
- **Schema:** Multi-tenant, RBAC, audit, domain entities.

## RBAC

- **Roles:** Admin, Dispatcher, Driver, Compliance Officer.
- **Enforcement:** Middleware, PermissionGuard, API, server actions.

## UI/UX

- **Design System:** shadcn/ui, Tailwind, responsive, dark/light.
- **Navigation:** Role-based sidebar, breadcrumbs, quick actions.
- **Forms:** React Hook Form + Zod, real-time validation, accessibility.

## Development Guidelines

- Feature modules are self-contained.
- TypeScript interfaces for all data.
- Error boundaries, naming conventions, documentation.
- Unit/integration/component/E2E tests.

## Security

- Multi-tenant isolation, RBAC, Zod validation, audit logging, rate limiting, CSRF, SQLi prevention.

## Deployment

- **Hosting:** Vercel (Next.js)
- **Database:** Neon Postgres
- **Auth:** Clerk
- **Monitoring:** Vercel Analytics

---

**For LLM agents:**  
Reference this page for architectural decisions, directory structure, and best practices.

---

[Official Docs](Official-Docs.md)
