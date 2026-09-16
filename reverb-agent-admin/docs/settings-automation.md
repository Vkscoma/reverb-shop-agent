# Settings and automation

The v1 Settings page centralizes global automation defaults, deployment safety visibility, manual sync, and recent automation activity. Automation is default-deny: no `AutomationSetting` row means both automations are disabled. The dry-run environment flag remains the master safety switch, and credentials and live-action flags are deployment configuration rather than editable application settings.

## Current v1

- `/settings` contains global offer-response and message-reply toggles.
- Safety state is read-only and warns when live mutations are possible.
- Sync status and summary are sourced from `SyncRun`.
- Planned, sent, and failed actions are sourced from `ReverbActionAudit`.
- Offers and Escalations link back to Settings instead of exposing duplicate global controls.

## Prioritized CMS roadmap

### Near term

Central Settings and automation controls; sync history and audit log; scheduled background sync; better listing search, filtering, and bulk operations; reusable message templates; per-listing automation overrides; and richer offer rules such as maximum discount and expiration behavior.

### Mid term

Listing editing, inventory and stock management, bulk repricing, orders and fulfillment, a customer inbox with saved replies, notifications, and dashboard analytics.

### Later

Multi-channel catalog management, shipping and tax integrations, roles and permissions, a workflow builder, AI-assisted listing copy and message drafting with human approval, and revenue/margin reporting.

Per-listing overrides should eventually be modeled as a separate override layer related to `ListingRule`/`SyncedListing`; they are intentionally not part of v1.
