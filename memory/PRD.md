# PRD — My Optical Wallet Privacy-First Enhancement

## Original Problem Statement
Enhance the existing app by keeping signed prescription photos local-only, simplifying patient records, and adding privacy-safe utility features without changing how GPS-based store discovery or affiliate links already work.

Key requirements implemented from the brief:
- Prescription photos stay local-only and are stored as photo-only records
- Expiration date is mandatory for each prescription
- Replace-only prescription flow with save confirmation before overwriting
- Multi-person profiles
- Optional PD per profile
- Optional warranty photo per profile
- Contact lens reminders stored locally per person
- Privacy explainer screen
- GPS-based store discovery preserved as a public/internet layer
- Shop links kept visually separate from the private vault

User choices applied:
- Reminder experience: in-app reminder center only
- Existing data: preserve if easy, otherwise prioritize privacy-first model
- Visual direction: light polish while keeping the current feel

## Architecture Decisions
- Frontend remains React and is now the primary privacy vault layer
- Private data is stored locally in IndexedDB via `frontend/src/lib/vault-storage.js`
- Frontend state is centralized in `frontend/src/context/VaultContext.jsx`
- Public store discovery uses browser GPS plus FastAPI `/api/public/optical-stores`
- Store finder keeps private vault data off the backend; only public coordinates are used for lookup
- Shop links are rendered separately as external links with no prescription data transfer
- UI follows earthy light polish design guidance with separate routes for Vault, Reminders, Stores, Shop, and Privacy

## What’s Implemented
- Dashboard with profile cards, current prescription visibility, expiration states, and utility shortcuts
- Add/edit person profiles with optional PD
- Profile page with current prescription card, optional warranty photo, and reminder summary
- Replace-only prescription dialog with required expiration date and overwrite confirmation
- Local-only reminder center with daily/biweekly/monthly/custom cadence plus expiration reminder timing
- Privacy screen separating local-only data from internet-powered features
- Shop page for external optical partner links
- Backend optical store API with safe maps fallback and non-blocking threaded fetch path
- Data-testid coverage added across key interactive and critical user-facing UI elements
- Regression coverage added in `/app/backend/tests/test_public_and_status_api.py`

## Prioritized Backlog
### P0
- Add local cleanup/reset controls for users who want to remove all device-stored vault data
- Improve store finder resiliency with additional public provider support and clearer no-result messaging

### P1
- Add profile deletion flow with confirmation
- Improve image compression and storage tuning for larger prescription/warranty photos
- Add richer expiration warning summaries on the dashboard

### P2
- Add optional device export/import flow for migrations
- Add more detailed reminder insights without introducing prescription history
- Add accessibility refinements and expanded visual regression coverage

## Next Tasks
1. Add vault reset/delete controls and profile removal flow
2. Improve public store search reliability beyond the current maps fallback path
3. Add smarter dashboard surfacing for upcoming expiration and reminder due states

## Latest Update
- Added an “Advertise With Us” email CTA in the sponsor-ready placement using mailto:alamotte1956@gmail.com so advertisers have a direct contact path where the ad slot is showcased
