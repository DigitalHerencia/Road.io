# Issue: Implement User Registration and Onboarding (Admin MVP)

## Description
Implement the user invitation system and welcome email automation for the Admin module. This includes UI for inviting users, backend logic for sending invitations, and automated welcome emails upon registration.

## Acceptance Criteria
- Admins can invite new users via email.
- Invitation emails contain a secure registration link.
- Upon registration, users receive a welcome email.
- All flows are tested and documented.

## References
- See `main/src/features/admin/` for UI and logic.
- Use server actions for mutations and email logic.

## Checklist
- [ ] User invitation UI and logic
- [ ] Secure invitation link generation
- [ ] Welcome email automation
- [ ] Tests and documentation

## Verification
- Invite a user and verify email delivery.
- Register via invitation and confirm welcome email.
- Run all tests and lint/typecheck.
