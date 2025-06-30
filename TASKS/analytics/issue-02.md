---
title: "[Analytics] Implement Operational KPIs (On-time Delivery & Cost per Mile)"
labels: [feature, analytics, MVP]
---

## Summary
Add Operational KPIs to the Analytics module: on-time delivery rates and cost per mile analysis.

## Acceptance Criteria
- [ ] Add server-side logic for on-time delivery and cost per mile.
- [ ] Update or create fetchers in `main/lib/fetchers/analytics.ts`.
- [ ] Display KPIs in the analytics dashboard (`main/features/analytics/`).
- [ ] Add unit and integration tests for calculations and UI.
- [ ] Passes lint, typecheck, and all tests.

## Verification Steps
1. Run `npm run lint` and `npm run typecheck` in `main/`.
2. Run all analytics tests: `npm run test -- analytics`.
3. Confirm KPIs are visible and accurate in the dashboard.

---
Closes # (link to parent epic or tracking issue)
