# Issue: Implement IFTA Report Generation (IFTA MVP)

## Description
Build IFTA report generation features for the IFTA module. This includes quarterly report creation, automated report generation, PDF export, tax calculation engine (rate management by jurisdiction, interest calculations).

## Acceptance Criteria
- Quarterly IFTA reports can be generated and exported as PDF.
- Tax calculation engine supports rate management and interest calculations.
- All flows are tested and documented.

## References
- See `main/src/features/ifta/` for UI and logic.
- Use server actions for report generation and tax calculation.

## Checklist
- [ ] Quarterly report creation and automation
- [ ] PDF export capability
- [ ] Tax calculation engine (rate management, interest)
- [ ] Tests and documentation

## Verification
- Generate and export IFTA reports; verify tax calculations and rates.
- Run all tests and lint/typecheck.
