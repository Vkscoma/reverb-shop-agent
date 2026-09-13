# Reverb Agent Admin

Next.js App Router dashboard for deterministic Reverb listing rules and human escalations. Styling uses Meta StyleX exclusively.

## Local setup

```bash
npm install
cp .env.example .env.local
# Add your REVERB_API_TOKEN to .env.local
npm run db:setup
npm run dev -- --webpack
```

For the live listings page, add the server-only Reverb token to `.env.local`:

```text
REVERB_API_TOKEN="your-token"
# Optional: use the sandbox while testing
REVERB_API_BASE_URL="https://sandbox.reverb.com/api"
```

Open [http://localhost:3000](http://localhost:3000). The main screens are:

- `/rules` — create, pause, activate, and delete listing rules.
- `/escalations` — review escalations and update their status.
- `/listings` — search live Reverb listings and copy their IDs.

The seed command creates demo rules and one demo escalation:

```bash
npm run db:seed
```

The theme toggle stores the user's light/dark preference in browser local storage. If no preference exists, the initial theme follows the operating system preference.

## Checks

```bash
npm run lint
npx tsc --noEmit
DATABASE_URL='file:./dev.db' npm run build -- --webpack
```
