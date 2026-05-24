# Remitly legal name change prototype

High-fidelity coded prototype for a Remitly-like profile settings page and a minimum viable flow that verifies identity again before changing a legal name.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 import with Remitly-aligned CSS tokens
- Mock Next route handlers for profile, preferred name, name-change request steps, status, and system updates
- Vitest for deterministic decision-engine coverage
- Playwright + axe for browser and accessibility checks

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000/us/en/users/settings/profile`.

## Verify

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run test:a11y
npm run build
npm run docs:check
```

## Prototype scenarios

- S1 happy path: approved after photo ID, name-change document, and selfie check pass; saved-card reminder appears after approval when a card is on file
- S2 needs more documents: asks for the missing name-change document
- S3 specialist review: explains that a routine safety check found a similar name, and that this does not mean the match is the customer
- S4 blocked account check: pauses before document collection and lets the customer request support review
- S5 preferred name only: updates greetings and support context; legal name stays unchanged
- S6 two written forms: accepts a passport as photo ID, but sends the case to review when the ID, proof, and Latin spelling do not line up clearly

Small spelling corrections are not a separate MVE scenario. They enter through the same legal-name request and can be policy-routed after account and evidence checks.

## Design constraints

Legal name is never shown as a free-text profile edit. The prototype treats it as a request that verifies identity again with an account check, sample documents, a sample selfie, a review result, previous-name history, system updates, and a support fallback. The flow does not ask users why their name changed; it asks for evidence that connects the old and new legal names. Preferred name is separate and only changes low-risk display and support surfaces.
