# Compliance Module

This module manages regulatory compliance documents and safety records. It now includes basic expiration tracking and DOT compliance tools.

## Expiration Alerts

- Documents can optionally specify an **Expiration Date** when uploaded.
- The `sendExpirationAlerts` server action checks for documents expiring within 30 days and emails the uploader.
- Alerts are logged via the audit system for traceability.

Run `sendExpirationAlerts()` periodically to keep users informed of upcoming renewals.

## Renewal Management

- `sendRenewalReminders` server action emails users about expiring documents.
- `markDocumentReviewed` marks a document as compliant once renewed.

## Compliance Dashboard

- `ComplianceDashboard` shows active and under review counts and monthly upload trends.
- `RenewalList` lists documents nearing expiration for quick action.

## DOT & Safety Compliance

- `recordAnnualReview` tracks driver qualification file reviews.
- `recordVehicleInspection` stores annual or daily vehicle inspections.
- `recordAccident` logs accident reports for safety tracking.
- `calculateSmsScore` summarizes accidents and HOS violations to provide a simple Safety Management System (SMS) score.


## Audit Trail Management

- `listComplianceAuditLogs` fetches recent compliance-related audit entries.
- `exportComplianceAuditLogsAction` downloads audit logs as CSV.

## Compliance Reporting

- `generateComplianceReportAction` creates a PDF summary of compliance activity.
- `ComplianceReportForm` submits report requests from the dashboard.
- Reports and audit activity are displayed in `ComplianceDashboard`.

## Workflow & Task Management

- `createComplianceWorkflowAction` creates approval workflows.
- `createComplianceTaskAction` adds tasks to a workflow.
- `completeComplianceTaskAction` marks tasks complete and updates status.
- `WorkflowList`, `WorkflowForm`, `TaskList`, and `TaskForm` provide basic UI.
