# Hours of Service Management

This module handles recording driver duty status changes and generating compliance reports.

## Features

- Electronic log entry form with support for manual and ELD sources.
- Automatic violation detection when a driver exceeds 11 hours of driving in a 24 hour period.
- Daily driver and fleet reports accessible to admins.

## Server Actions

- `recordHosLog` – save a log entry and check for rule violations.
- `getDriverHosReport` – return logs for a specific day.
- `getFleetHosReport` – return fleet wide logs for a day.

All actions require the appropriate permissions as defined in the RBAC system.
