# Road.io Feature Architecture

## Overview

This document outlines the comprehensive feature-driven architecture for Road.io, a modern multi-tenant SaaS fleet management platform. The architecture is designed to support all user roles (Admin, Dispatcher, Driver, Compliance Officer) with role-based access control (RBAC) and audit logging.

## Architecture Principles

1. **Feature-Driven Structure**: Each major domain has its own feature module
2. **Server-First Rendering**: Using Next.js 15 App Router with React Server Components
3. **Multi-Tenant RBAC**: Role-based access control with organization-level isolation
4. **Audit Logging**: Comprehensive activity tracking for compliance
5. **Type Safety**: Full TypeScript implementation with Zod validation
6. **Modern UI**: shadcn/ui components with Tailwind CSS
7. **Database-First**: Drizzle ORM with Neon Postgres

## Directory Structure

```
src/
├── features/                    # Feature-driven modules
│   ├── admin/                   # Admin-specific features
│   │   ├── components/          # UI components
│   │   ├── hooks/              # Custom hooks
│   │   ├── types/              # TypeScript interfaces
│   │   ├── utils/              # Helper functions
│   │   └── constants/          # Domain constants
│   ├── dispatch/               # Load management
│   ├── vehicles/               # Fleet management
│   ├── drivers/                # Driver management
│   ├── compliance/             # Regulatory compliance
│   ├── ifta/                   # IFTA reporting
│   ├── analytics/              # Dashboards and metrics
│   └── settings/               # Company/user settings
├── lib/
│   ├── fetchers/               # Domain-specific data fetchers
│   │   ├── loads.ts
│   │   ├── vehicles.ts
│   │   ├── drivers.ts
│   │   ├── compliance.ts
│   │   └── analytics.ts
│   ├── actions/                # Server actions per domain
│   │   ├── fleet.ts           # Existing fleet actions
│   │   ├── admin.ts           # Admin-specific actions
│   │   ├── compliance.ts      # Compliance actions
│   │   └── analytics.ts       # Analytics actions
│   ├── schema.ts              # Database schema
│   ├── rbac.ts                # RBAC utilities
│   ├── audit.ts               # Audit logging
│   └── db.ts                  # Database connection
├── app/
│   ├── dashboard/             # Role-specific dashboards
│   │   ├── admin/             # Admin dashboard
│   │   ├── dispatcher/        # Dispatcher dashboard
│   │   ├── driver/            # Driver dashboard
│   │   └── compliance/        # Compliance dashboard
│   ├── api/                   # API routes
│   └── globals.css
└── components/
    ├── ui/                    # shadcn/ui components
    ├── shared/                # Shared components
    └── layout/                # Layout components
```

## Feature Modules

### 1. Admin Module (`/features/admin`)

**Purpose**: Administrative functions, user management, system configuration

**Key Components**:
- User management interface
- Role assignment system
- Organization settings
- Billing management (if applicable)
- System audit logs viewer
- Company profile management

### 2. Dispatch Module (`/features/dispatch`)

**Purpose**: Load management, driver/vehicle assignment, real-time tracking

**Key Components**:
- Load creation and editing forms
- Assignment interface (drag-and-drop)
- Real-time status tracking board
- Route planning
- Dispatch board dashboard
- Load history and reports

### 3. Vehicles Module (`/features/vehicles`)

**Purpose**: Fleet management, maintenance tracking, vehicle assignments

**Key Components**:
- Vehicle registration forms
- Maintenance scheduling
- Inspection tracking
- Vehicle availability dashboard
- Fuel efficiency monitoring
- Vehicle document management

### 4. Drivers Module (`/features/drivers`)

**Purpose**: Driver management, licensing, hours of service tracking

**Key Components**:
- Driver profile management
- License and certification tracking
- Hours of Service (HOS) logging
- Driver performance metrics
- Document expiration alerts
- Driver assignment interface

### 5. Compliance Module (`/features/compliance`)

**Purpose**: Regulatory compliance, document management, audit preparation

**Key Components**:
- Document upload interface
- Expiration tracking system
- Compliance status dashboard
- Audit log viewer
- Report generation
- Automated notifications

### 6. IFTA Module (`/features/ifta`)

**Purpose**: International Fuel Tax Agreement reporting and tracking

**Key Components**:
- Mileage tracking by jurisdiction
- Fuel purchase logging
- IFTA report generation
- Tax calculation tools
- Quarterly reporting dashboard

### 7. Analytics Module (`/features/analytics`)

**Purpose**: Performance metrics, financial tracking, operational insights

**Key Components**:
- Fleet utilization dashboards
- Performance metrics
- Financial reporting
- Operational KPIs
- Custom report builder
- Data visualization charts

### 8. Settings Module (`/features/settings`)

**Purpose**: Company configuration, user preferences, system settings

**Key Components**:
- Company profile management
- User roles and permissions
- System preferences
- Notification settings
- Integration configurations

## Data Layer

### Fetchers (`/lib/fetchers`)

Each domain has dedicated fetchers that handle:
- Data retrieval with RBAC filtering
- Caching and optimization
- Error handling
- Multi-tenant isolation

### Server Actions (`/lib/actions`)

Domain-specific server actions with:
- Zod validation schemas
- RBAC permission checks
- Audit logging integration
- Error handling and rollback

### Database Schema

Multi-tenant schema with:
- Organization-level isolation
- RBAC role and permission tables
- Audit logging tables
- Domain-specific entities (loads, vehicles, drivers, etc.)

## Role-Based Access Control

### Roles and Permissions

1. **Admin**
   - Full system access
   - User management
   - Organization settings
   - Billing and subscriptions

2. **Dispatcher**
   - Load management
   - Driver/vehicle assignment
   - Dispatch tracking
   - Route planning

3. **Driver**
   - View assigned loads
   - Update load status
   - Upload documents (POD, receipts)
   - HOS logging

4. **Compliance Officer**
   - Document management
   - Compliance tracking
   - Audit preparation
   - Regulatory reporting

### Implementation

- Route-level protection using middleware
- Component-level guards with `PermissionGuard`
- API endpoint protection
- Server action validation

## UI/UX Patterns

### Design System

- **shadcn/ui** components for consistency
- **Tailwind CSS** for styling
- **Responsive design** for mobile/desktop
- **Dark/light mode** support

### Navigation

- Role-based sidebar navigation
- Breadcrumb navigation
- Quick actions toolbar
- Search and filter capabilities

### Forms

- **React Hook Form** with Zod validation
- **Progressive enhancement** for server actions
- **Real-time validation** feedback
- **Accessibility** compliant

## Development Guidelines

### Code Organization

1. Keep feature modules self-contained
2. Use TypeScript interfaces for all data structures
3. Implement proper error boundaries
4. Follow consistent naming conventions
5. Document complex business logic

### Testing Strategy

1. Unit tests for utilities and hooks
2. Integration tests for server actions
3. Component tests for UI interactions
4. E2E tests for critical user flows

### Performance Considerations

1. Use React Server Components where possible
2. Implement proper caching strategies
3. Optimize database queries
4. Use streaming for large data sets
5. Implement progressive loading

## Security Considerations

1. **Multi-tenant isolation** at database level
2. **RBAC enforcement** at all layers
3. **Input validation** with Zod schemas
4. **Audit logging** for all critical actions
5. **Rate limiting** for API endpoints
6. **CSRF protection** for forms
7. **SQL injection** prevention with Drizzle ORM

## Deployment and Monitoring

### Infrastructure

- **Vercel** for hosting (Next.js optimized)
- **Neon Postgres** for database
- **Clerk** for authentication
- **Vercel Analytics** for monitoring

### Monitoring

- Error tracking and alerting
- Performance monitoring
- Audit log analysis
- User behavior analytics

## Next Steps

1. Implement core feature modules
2. Create comprehensive TODO lists for each domain
3. Build role-based dashboard layouts
4. Implement server actions and fetchers
5. Add comprehensive testing
6. Deploy to production environment

This architecture provides a solid foundation for building a scalable, maintainable, and secure fleet management platform that can grow with business needs.
