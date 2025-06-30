# Issue: Implement User Profile Management (Admin MVP)

## Description
Build the user profile management interface and backend for the Admin module. This includes listing all users, editing profiles, managing roles, updating user statuses, and supporting bulk operations.

## Acceptance Criteria
- Admins can view all users in the organization.
- Admins can edit user profiles and assign roles.
- User status (Active, Inactive, Suspended) can be updated.
- Bulk operations (e.g., activate/deactivate multiple users) are supported.
- All flows are tested and documented.

## References
- See `main/src/features/admin/` for UI and logic.
- Use server actions for user updates and role management.

## Checklist
- [ ] User list UI and logic
- [ ] Edit profile and role assignment
- [ ] User status management
- [ ] Bulk user operations
- [ ] Tests and documentation

## Verification
- List users and verify data accuracy.
- Edit a user and confirm changes.
- Perform bulk operations and check results.
- Run all tests and lint/typecheck.
