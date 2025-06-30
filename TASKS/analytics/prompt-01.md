# Codex Prompt: Implement Fleet Utilization Metrics (Analytics MVP)

## Code pointers
- Focus on `main/lib/fetchers/analytics.ts` for data logic and fetchers.
- UI should be added/updated in `main/features/analytics/` (dashboard components).
- Use server components and server-first rendering.

## Task
Implement vehicle utilization rates and capacity utilization metrics for the analytics dashboard. Write server-side logic, fetchers, and UI components as needed. Ensure all code is modular and feature-driven.

## Verification steps
- Run `npm run lint` and `npm run typecheck` in `main/`.
- Run all analytics tests: `npm run test -- analytics`.
- View the analytics dashboard and confirm correct display of utilization metrics.

## How to work
- Use only server components unless client interactivity is required.
- Add/modify tests for all new logic.
- Follow PR/branch conventions and update docs if needed.
- Present your work as a PR with a clear title and checklist.
