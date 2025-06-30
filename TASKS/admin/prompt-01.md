# Codex Prompt: Implement User Registration and Onboarding (Admin MVP)

## Task
Implement the user invitation and onboarding flow for the Admin module.

## Context
- Location: `main/src/features/admin/`
- UI: Add invitation form and user list management.
- Backend: Add server actions for invitation, secure link generation, and welcome email.
- Use existing email utility or create one in `main/src/lib/` if needed.

## Steps
1. Create UI for inviting users (form, validation, feedback).
2. Implement backend logic for sending invitation emails with secure links.
3. On registration, trigger welcome email.
4. Add tests for all flows.
5. Document the process in module README.

## Verification
- Invite a user and check for invitation email.
- Register via the link and confirm welcome email.
- All tests pass, code is linted and typed.

## Output
- Updated files in `main/src/features/admin/` and `main/src/lib/` as needed.
- Tests and documentation.
