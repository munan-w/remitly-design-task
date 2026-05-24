# Prompt log

## 2026-05-23

### Implementation prompt

User asked Codex to review local `AGENTS.md`, `DESIGN.md`, `foundational-research-report.md`, `remitly-design-system.mcp.md`, supplied profile screenshot, and Figma design-system URL, then create a coded prototype for team review of feasibility and practicality.

### Resulting changes

- Built Next.js + TypeScript prototype at `/us/en/users/settings/profile`.
- Added Remitly-aligned tokens, profile settings anatomy, legal-name change flow, preferred-name fast lane, and deterministic scenario selector.
- Added mock API contracts listed in `AGENTS.md`.
- Added decision engine, fixtures, sample fake documents, unit tests, Playwright e2e tests, axe tests, README, and docs check.

### Source context used

- `DESIGN.md`: product framing, flow, risk controls, delivery/test plan.
- `AGENTS.md`: canonical product rules, mock statuses, required scenario coverage, definition of done.
- `foundational-research-report.md`: framing that legal-name change is remote identity reproofing, not profile edit.
- `remitly-design-system.mcp.md`: Remitly colors, typography, profile layout, settings rows, buttons, accessibility rules.
- Figma node `2:109`: token foundation frame confirming color, type, spacing, radius, and breakpoint values.
- Supplied profile screenshot: authenticated settings layout anatomy.

### Content polish prompt

User asked Codex to make the prototype easier to understand with content design, including clearer action labels such as `Request change`, clearer scenario descriptions, and fewer acronyms or internal terms.

### Resulting changes

- Rewrote scenario labels and helper text in plain language.
- Changed legal-name action from `Request` to `Request change`.
- Replaced internal terms with customer-facing language for account checks, specialist review, system updates, supporting documents, and previous-name history.
- Updated tests and README to match the visible content.

### Scenario IA polish prompt

User asked whether the `Reason` step was necessary, called out confusing scenario logic, and asked for clearer situations: happy path, specialist review, needs more documents, blocked account check with review request, and clearer document guidance.

### Resulting changes

- Removed the user-facing reason step from the legal-name flow.
- Moved users from account check directly to documents.
- Reframed scenarios around outcomes rather than personal life events.
- Folded saved-card checking into the approved happy path instead of making it a separate scenario.
- Clarified document examples: photo ID can be a driver's license, state ID, passport, or other government photo ID; name-change proof can be a court order, marriage certificate, divorce decree, or legal name-change certificate.

### Scenario review prompt

User asked what S3 "name match" means, whether S6 spelling fix is needed, and when S7 two written forms would trigger. User also asked whether passport upload can satisfy the document need.

### Resulting changes

- Replaced "possible name match" with "similar name found by a routine safety check" and added copy that this does not mean the customer is the match.
- Removed small spelling correction as a standalone MVE scenario. It now enters through the same legal-name request and can be routed by policy after account and evidence checks.
- Renumbered two-written-form review to S6 and clarified the trigger: passport/photo ID may resolve it when both written forms are clear; specialist review is for cases where ID, proof, and Latin spelling do not line up clearly.
- Updated decision-engine notes, UI helper copy, tests, README, AGENTS.md, and decisions log.
