---
title: "[Analytics] Implement Safety Analytics (Accident Rate & Incident Reporting)"
labels: [feature, analytics, MVP]
---

## Summary
Implement Safety Analytics for the Analytics module, including accident rate tracking and safety incident reporting.

## Acceptance Criteria
- [ ] Add server-side logic and fetchers for accident rate and incident reporting in `main/lib/fetchers/analytics.ts`.
- [ ] Display safety metrics in the analytics dashboard (`main/features/analytics/`).
- [ ] Add unit and integration tests for safety analytics and UI.
- [ ] Passes lint, typecheck, and all tests.

## Verification Steps
1. Run `npm run lint` and `npm run typecheck` in `main/`.
2. Run all analytics tests: `npm run test -- analytics`.
3. Confirm safety metrics are visible and accurate in the dashboard.

---
Closes # (link to parent epic or tracking issue)
