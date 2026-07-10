# CoreSleep / Corebed Redesign

Initial Next.js storefront foundation based on the July 6, 2026 redesign requirements document.

## Included in this first pass

- Premium homepage using the beige, navy and bronze direction from the provided screenshots
- Shared storefront pages for `shop`, `compare`, `materials`, `guides`, `faq` and `account`
- Reusable header, footer and product card components
- Starter Prisma schema mapped from the requirements document
- Theme tokens ready for Tailwind-based expansion

## Suggested next steps

1. Install dependencies with `cmd /c npm install`
2. Run the app with `npm run dev`
3. Add Prisma client, migrations and seed data
4. Replace shared mock data with database-backed loaders
5. Implement auth, cart state, checkout and admin flows
