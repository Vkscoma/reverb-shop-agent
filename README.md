# Reverb Agent Admin

Next.js App Router dashboard for deterministic Reverb listing rules and human escalations. Styling uses Meta StyleX exclusively.

## Local setup

```bash
npm install
cp .env.example .env.local
# Add the Neon DATABASE_URL, DATABASE_URL_UNPOOLED, REVERB_API_TOKEN, and CRON_SECRET values to .env.local
npm run db:setup
npm run dev -- --webpack
```

For the live listings page, add the server-only Reverb token to `.env.local`:

```text
REVERB_API_TOKEN="your-token"
# Optional: use the sandbox while testing
REVERB_API_BASE_URL="https://sandbox.reverb.com/api"
```

Phase 3 automation is intentionally safe by default. Keep these values while validating the daily dry run:

```text
REVERB_OWNER_ID="your-reverb-account-id"
REVERB_DRY_RUN="true"
REVERB_ENABLE_MESSAGE_REPLIES="false"
REVERB_ENABLE_OFFER_ACTIONS="false"
REVERB_ENABLE_AUTOMATED_OFFER_ACTIONS="false"
```

The sync route records planned replies and offer decisions in `ReverbActionAudit`. The `/offers` page lets you explicitly approve an offer action. For manual offer actions, set `REVERB_DRY_RUN="false"` and `REVERB_ENABLE_OFFER_ACTIONS="true"`; leave `REVERB_ENABLE_AUTOMATED_OFFER_ACTIONS="false"` so the daily sync does not act before review. Message replies are limited to existing conversations, and informal price mentions receive the approved instruction to submit an official Reverb offer.

Open [http://localhost:3000](http://localhost:3000). The main screens are:

- `/rules` — create, pause, activate, and delete listing rules.
- `/escalations` — review escalations and update their status.
- `/listings` — search live Reverb listings and copy their IDs.
- `/offers` — review planned offer decisions and send an approved action to Reverb.

The seed command creates demo rules and one demo escalation:

```bash
npm run db:seed
```

The theme toggle stores the user's light/dark preference in browser local storage. If no preference exists, the initial theme follows the operating system preference.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

## Styling

All application styling uses StyleX. Make page-specific changes in the `const styles = stylex.create({...})` object in the relevant file under `src/app`. Shared light/dark colors and global element defaults live in `src/app/globals.css`; navigation styles are in `src/app/dashboard-nav.tsx`; theme persistence and the toggle are in `src/app/theme-provider.tsx` and `src/app/theme-toggle.tsx`. Do not add Tailwind classes or CSS modules.
