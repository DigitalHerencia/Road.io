# Vehicles Module
This feature module manages fleet vehicles, maintenance and advanced telematics.

## Advanced Features

- **Fuel Tracking** – fuel purchases are logged via existing IFTA records and
  aggregated per vehicle.
- **Telematics Integration** – `recordVehicleTelematics` stores GPS and
  diagnostics data in the `vehicle_telematics` table. `TelematicsStatus` displays
  the latest information.
- **Document Management** – vehicle documents are uploaded using the compliance
  system and linked via the `vehicle_id` column on the `documents` table. Use
  `VehicleDocumentsList` to display them.

Fetchers and actions live in `lib/fetchers/vehicles.ts` and
`lib/actions/vehicles.ts`.

This module manages fleet vehicles and maintenance operations.

## Performance Optimization

Vehicle fetchers use `unstable_cache` with `vehicles` tags to cache lists and metrics. Server actions call `revalidateTag` to ensure data stays fresh when vehicles or maintenance records change.

## Mobile Features

`MobileMaintenanceForm` and `MobileInspectionForm` allow technicians to record maintenance and inspections from mobile devices. Submissions are queued in `localStorage` when offline and automatically sent when connectivity returns.

## Security Hardening

- All server actions require RBAC permissions via `requirePermission`.
- Inputs are validated with Zod schemas before database writes.
- Telematics data uses `safeParseJSON` to safely parse JSON payloads.
- Audit logs capture vehicle changes for compliance.

## Testing

- Unit tests cover fetchers, actions and React components under `main/tests/vehicles`.
- Additional schema tests ensure validation rules.
- Run `npm run test` from the `main` directory to execute the suite.
