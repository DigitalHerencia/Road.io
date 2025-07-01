# Dispatch Task 01: Implement Load Management (Dispatch MVP)

## Description
Build the load management features for the Dispatch module. This includes load creation, editing, and status tracking (Created → Assigned → In Transit → Delivered → Completed), as well as exception handling.

## Acceptance Criteria
- Loads can be created with all required information (origin, destination, cargo, rate, billing).
- Loads can be edited and status updated manually.
- Status progression and exception handling are supported.
- All flows are tested and documented.

## References
- See `main/src/features/dispatch/` for UI and logic.
- Use server actions for load CRUD and status updates.
- See [Development Standards](../Development-Standards.md) for architecture and validation.
- See [Official Docs](../Official-Docs.md) for Next.js and Drizzle ORM usage.

## Checklist
 - [x] Load creation form and logic
 - [x] Load editing interface
 - [x] Status tracking and exception handling
 - [x] Tests and documentation

## Verification
- Create, edit, and update load status; verify all flows.
- Run all tests and lint/typecheck.

---

**LLM Agent Guidance:**
- Use feature-driven architecture and server actions for all mutations.
- Validate all load data with Zod.
- Update documentation and wiki as needed.
