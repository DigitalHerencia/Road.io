# Settings Task 01: Implement Company Profile Management (Settings MVP)

## Description
Build company profile management features for the Settings module. This includes basic company information, business hours configuration, transportation authority (DOT number, USDOT status), and tax/financial information (EIN, banking, payment details).

## Acceptance Criteria
- Company name, legal entity, and business hours can be managed.
- DOT number and USDOT registration status are tracked.
- Federal tax ID, banking, and payment details are configurable.
- All flows are tested and documented.

## References
- See `main/src/features/settings/` for UI and logic.
- Use server actions for company profile updates.
- See [Development Standards](../Development-Standards.md) for architecture and validation.
- See [Official Docs](../Official-Docs.md) for Next.js and Drizzle ORM usage.

## Checklist
- [ ] Basic company information and business hours
- [ ] DOT number and USDOT status
- [ ] Tax and financial information
- [ ] Tests and documentation

## Verification
- Update company profile and verify all fields and flows.
- Run all tests and lint/typecheck.

---

**LLM Agent Guidance:**
- Use feature-driven architecture and server actions for all mutations.
- Validate all company profile data.
- Update documentation and wiki as needed.
