# Dispatch Module

This module manages load assignment and tracking. It now includes basic reporting
and analytics.

## Reporting & Analytics

- `LoadCompletionReport` shows total loads, completed loads, and on-time delivery
  metrics.
- `DriverProductivityTable` lists drivers with their completed load counts.
- `DispatchKPIDashboard` is a client component that polls server actions every
  few seconds to display active loads, completion totals, on-time rate, and
  exception rate.

All metrics are calculated via fetchers in `lib/fetchers/dispatch.ts` and exposed
through server actions in `lib/actions/dispatch.ts`.

