# Web access findings

Checked on 2026-08-11.

- Preview URL `https://8081-iwbksx2n6f8b6qvkfep4l-6637a30a.us1.manus.computer/` loads the IT Service Manager interface successfully in the browser. The page shows Manager Servicii, dashboard counters, filters, synchronization, and tabs.
- Public URL `https://itservmgr-kisnkolw.manus.space/` does not currently serve the app; browser navigation returns an HTTP response error consistent with the reported 404.
- The public domain therefore requires a publish/deployment action; the sandbox preview URL is the currently verified working address.
- Current dev server status was running after restart, with TypeScript/LSP reported clean by the project status check.

## Important product note
The verified preview URL is temporary and may change after sandbox restart. The Manus public domain is not live until the project is published from the project UI.

## Telegram integration note
The web app contains a `/api/labels/send-telegram` route and a SendLabelButton component, but the live end-to-end Telegram send flow still requires testing with the configured bot secret.
