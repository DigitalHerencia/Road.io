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
