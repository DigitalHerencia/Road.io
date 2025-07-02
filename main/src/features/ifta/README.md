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
