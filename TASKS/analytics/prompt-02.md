# Codex Prompt: Implement Operational KPIs (Analytics MVP)

## Code pointers
- Use `main/lib/fetchers/analytics.ts` for KPI logic and data fetching.
- UI updates go in `main/features/analytics/` (dashboard components).

## Task
Implement on-time delivery rate and cost per mile KPIs for the analytics dashboard. Ensure server-first rendering and modular code.

## Verification steps
- Run `npm run lint` and `npm run typecheck` in `main/`.
- Run all analytics tests: `npm run test -- analytics`.
- Confirm KPIs are visible and accurate in the dashboard.

## How to work
- Use server components unless client interactivity is required.
- Add/modify tests for all new logic.
- Follow PR/branch conventions and update docs if needed.
- Present your work as a PR with a clear title and checklist.
