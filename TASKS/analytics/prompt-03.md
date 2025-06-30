# Codex Prompt: Implement Real-time Dashboards (Analytics MVP)

## Code pointers
- Use `main/lib/fetchers/analytics.ts` for real-time data logic and fetchers.
- UI updates go in `main/features/analytics/` (dashboard components).

## Task
Implement live fleet status and performance alerts for the analytics dashboard. Use server-first rendering and modular code. Integrate real-time data updates (polling or websockets if needed).

## Verification steps
- Run `npm run lint` and `npm run typecheck` in `main/`.
- Run all analytics tests: `npm run test -- analytics`.
- Confirm live fleet status and alerts are visible and update in real time on the dashboard.

## How to work
- Use server components unless client interactivity is required.
- Add/modify tests for all new logic.
- Follow PR/branch conventions and update docs if needed.
- Present your work as a PR with a clear title and checklist.
