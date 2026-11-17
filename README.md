# BrightOrbit ShareHub

**One Link. Your Entire Workshop.**

An interactive market-validation prototype by BrightOrbit Labs for independent trainers, tutors, and community organizers. React 19, TypeScript, Tailwind CSS 4, and Vite; static assets are compatible with Cloudflare Workers. No backend, paid API, AI service, authentication, payments, or external database is connected.

## Run locally

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
```

The production output is `dist/`. `wrangler.jsonc` describes a Cloudflare Workers static-assets deployment with SPA fallback. Deployment is deliberately not performed as part of this task. A future approved deployment can use Wrangler with the owner's Cloudflare account.

## What to explore

- Responsive landing page with CSS illustrations and three synthetic workshop examples.
- Guided four-step onboarding via “Try your free workspace,” with Restart Tour in settings.
- Dashboard statistics calculated from registrations, attendance, and feedback; title search.
- Create/edit/duplicate/delete workshops; duplication excludes participant and feedback data.
- Registration validates email, capacity, and duplicate email. Participant removal and attendance controls.
- Resource links, feedback ratings and comments, attendance-gated certificate previews and downloadable PDFs (jsPDF loaded on demand).
- Public-page preview, copyable links, locally generated QR codes.
- Referral invitation copy, explicit simulated referral visits, local pricing interest and interaction log export.
- Free / $9 / $19 / $49 illustrative pricing; About, Contact, Privacy, and Terms.
- Settings: **Load Demo Data**, **Restore Original Examples**, **Reset My Workspace**, **Restart Tour**. Destructive actions use confirmation dialogs.

## Data and demonstration limits

Data lives only in `localStorage`, under `brightorbit-sharehub-v1`. First use loads three fictional workshops with 18 synthetic registrations. Load Demo Data adds missing examples; Restore Original Examples replaces the workspace; Reset My Workspace empties workshops and interaction history. A separate local contact draft uses `sharehub-contact` and can be deleted on the Privacy page.

Shared URLs and QR codes contain a workshop ID, not workshop data. They preview records available in the current browser/origin. They do not provide real cross-device or multi-user sharing. Participants, feedback, and organizer changes are not synchronized between browsers or tabs. Browser storage can be cleared or unavailable; there is no backup. Use fictional information only.

Public and organizer views are interface demonstrations, not security boundaries. No emails are delivered. Pricing does not enforce limits or create subscriptions. Referrals do not issue rewards. Certificates are demo PDFs, not accredited credentials. Contact form submissions are saved locally and never sent. Resource links lead to external websites when deliberately clicked.

## Validation and review

Automated coverage includes example statistics, capacity/duplicate registration validation, independent example data, persistence, malformed storage recovery, empty-workspace behavior, and a rendered interaction journey from creation through registration, attendance, certificates, resources, feedback, and sharing.

The managed preview relay failed with `timed out waiting for relay readiness`; browser visual QA was unavailable. Desktop/mobile layouts and actual PDF download should be reviewed in a local browser before approval.

Work is isolated on `feat/sharehub-prototype`. Review its diff against the repository's default branch and open a pull request when ready. Do not merge or publish without the owner's approval.

Before production: add authenticated organizer authorization, a server-side database, validated public registration endpoints, privacy/retention controls, reliable sharing, email delivery, backups, rate limits, and cross-browser/accessibility testing. Revisit the illustrative prices after market feedback.
