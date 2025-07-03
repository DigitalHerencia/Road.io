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
