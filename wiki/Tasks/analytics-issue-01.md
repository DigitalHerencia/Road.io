# Analytics Task 01: Implement Fleet Utilization Metrics (MVP)

## Summary
Implement the Fleet Utilization Metrics feature for the Analytics module. This includes vehicle utilization rates and capacity utilization reports.

## Acceptance Criteria
- Add server-side logic to compute vehicle utilization rates and capacity utilization.
- Create or update fetchers in `main/lib/fetchers/analytics.ts` for utilization data.
- Add UI components to display metrics in the analytics dashboard (`main/features/analytics/`).
- Add unit tests for calculation logic and fetchers.
- Add integration tests for dashboard display.
- Passes lint, typecheck, and all tests.

## Verification Steps
1. Run `npm run lint` and `npm run typecheck` in `main/`.
2. Run all analytics tests: `npm run test -- analytics`.
3. View the analytics dashboard and confirm correct display of utilization metrics.
4. Review code for feature-driven structure and server-first rendering.

## References
- See `main/features/analytics/` for UI and logic.
- See [Development Standards](../Development-Standards.md) for best practices.
- See [Official Docs](../Official-Docs.md) for Next.js, Drizzle, and analytics stack.

---

**LLM Agent Guidance:**
- Use server-first rendering and feature-driven architecture.
- Write all fetchers as async, typed functions.
- Add or update documentation as needed.
