# Vehicles Module

This module manages fleet vehicles and maintenance operations.

## Performance Optimization

Vehicle fetchers use `unstable_cache` with `vehicles` tags to cache lists and metrics. Server actions call `revalidateTag` to ensure data stays fresh when vehicles or maintenance records change.

## Mobile Features

`MobileMaintenanceForm` and `MobileInspectionForm` allow technicians to record maintenance and inspections from mobile devices. Submissions are queued in `localStorage` when offline and automatically sent when connectivity returns.
