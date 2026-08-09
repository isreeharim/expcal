## 2026-08-09 - SSRF Vulnerability in Webhook Sync
**Vulnerability:** The Google Sheets backup sync functionality allowed users to configure arbitrary webhook URLs, leading to Server-Side Request Forgery (SSRF) when the server fetched these URLs.
**Learning:** The UI validation was present (via `saveGoogleSheetsWebhookUrl`), but the actual fetch execution (`syncGoogleSheetsBackup` and `app/api/backup/sheets/route.ts`) lacked defense-in-depth URL validation, trusting the database value blindly.
**Prevention:** Always validate external URLs immediately before passing them to server-side `fetch` calls, even if they were validated upon initial save, to ensure defense-in-depth and prevent SSRF.
