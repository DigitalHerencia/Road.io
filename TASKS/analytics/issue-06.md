---
title: "[Analytics] Implement Profit Margin Analysis (Gross Margin by Load & Driver Profitability)"
labels: [feature, analytics, MVP]
---

## Summary
Implement profit margin analysis for the Analytics module, including gross margin by load and driver profitability.

## Acceptance Criteria
- [ ] Add server-side logic and fetchers for gross margin by load and driver profitability in `main/lib/fetchers/analytics.ts`.
- [ ] Display profit metrics in the analytics dashboard (`main/features/analytics/`).
- [ ] Add unit and integration tests for profit calculations and UI.
- [ ] Passes lint, typecheck, and all tests.

## Verification Steps
1. Run `npm run lint` and `npm run typecheck` in `main/`.
2. Run all analytics tests: `npm run test -- analytics`.
3. Confirm profit metrics are visible and accurate in the dashboard.

---
Closes # (link to parent epic or tracking issue)
