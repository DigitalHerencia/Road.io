# Admin Module

This module handles administrative functionality such as user management.

## Invitation Flow

Invitations are sent via the `inviteUserAction` server action which creates a record in `user_invitations` and emails the invitee a secure link.
Upon account creation, the `sendWelcomeEmailAction` sends a welcome email. SMTP credentials are required in `.env.local`:

```
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user"
SMTP_PASS="pass"
EMAIL_FROM="Road.io <noreply@road.io>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Pages

- `/dashboard/admin/users` – Invite users, manage roles and statuses.
- `/dashboard/admin/users/[id]/edit` – Edit an individual user profile.
- `/dashboard/admin/roles` – Manage custom roles and permissions.
- `/dashboard/admin/company` – Manage company profile and branding.
- `/dashboard/admin/tenant` – Multi-tenant administration and monitoring.

