# Compliance Module

This module manages regulatory compliance documents. It now includes basic expiration tracking.

## Expiration Alerts

- Documents can optionally specify an **Expiration Date** when uploaded.
- The `sendExpirationAlerts` server action checks for documents expiring within 30 days and emails the uploader.
- Alerts are logged via the audit system for traceability.

Run `sendExpirationAlerts()` periodically to keep users informed of upcoming renewals.
