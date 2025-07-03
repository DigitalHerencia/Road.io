# IFTA Compliance

This feature manages IFTA record keeping and audit support.

## Document Retention

- `uploadIftaDocumentsAction` uploads supporting documents under the `ifta` category using the existing compliance storage system.
- Files are saved to `main/public/uploads` and stored in the `documents` table.

## Audit Preparation

- `exportIftaRecordsAction` downloads trips, fuel purchases and generated reports for a quarter as a gzip compressed CSV bundle.

## Audit Response

- `recordIftaAuditResponseAction` stores auditor questions and responses in the `ifta_audit_responses` table.
- Responses are logged to the audit trail for traceability.

Use the fetchers in `lib/fetchers/ifta.ts` to retrieve documents and audit responses for dashboard views.

## ELD Data Import

- `importEldCsvAction` processes ELD CSV files uploaded via `EldImportForm`.
- Each row creates a trip record with mileage calculated server side.
- Imported trips are logged with the `eld.import` audit action.

## Fleet Integration

- Vehicle assignments are synced from the dispatch module when trips are imported.
- Use `importEldCsvAction` to keep IFTA mileage in sync with dispatch loads.

## Analytics & Tax Optimization

- `getFuelEfficiencyAction` and `getRouteEfficiencyAction` return fuel usage and route metrics for the organization.
- `getTaxOptimizationAction` lists jurisdictions with the lowest fuel tax rates to assist in planning fuel stops.
- Use `FuelRouteAnalytics` and `TaxOptimizationTools` components on `/dashboard/ifta/analytics` for visualizations.

## Dashboard Components

- `IFTADashboard` provides an overview of trips, fuel purchases and reports.
- `TripLogger` and `FuelPurchaseForm` allow manual data entry.
- `ReportGenerator` creates quarterly reports via `generateIftaReportAction`.
- `JurisdictionManager` manages tax rates by quarter.
- `ReceiptProcessor` uploads receipts for OCR processing.
- `TaxCalculator` estimates tax due without creating a report.
- `ComplianceTracker` lists auditor questions and responses.

## API Endpoints

The IFTA module exposes a small public API for integration purposes. Each route requires Clerk authentication and the appropriate permission.

- `GET /api/ifta/trips` – List recorded trips for the authenticated organization.
- `POST /api/ifta/trips` – Record a new trip.
- `GET /api/ifta/fuel` – Retrieve fuel purchases.
- `POST /api/ifta/fuel` – Log a fuel purchase.
- `GET /api/ifta/reports` – List generated IFTA reports.
- `POST /api/ifta/reports` – Generate a new IFTA report.
- `GET /api/ifta/taxes` – Fetch tax rates for a quarter (`?quarter=2024Q1`).
- `POST /api/ifta/taxes` – Calculate estimated tax due.
- `POST /api/ifta/import?type=eld|fuelCard` – Import ELD or fuel card CSV data.
- `GET /api/ifta/compliance` – List audit responses.
- `POST /api/ifta/compliance` – Record an audit response.
