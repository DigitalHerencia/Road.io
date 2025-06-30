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

## Page

- `/dashboard/admin/users` – Invite users and view the user list.
