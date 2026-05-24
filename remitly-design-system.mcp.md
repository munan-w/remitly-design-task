# Remitly Design System MCP Spec

Purpose: mobile-first design-system file for AI agents that need to generate Remitly-aligned product concepts with minimal token/component drift.

Status: inferred from public Remitly web UI, authenticated profile review, and supplied authenticated profile screenshot. Treat as a reconstruction, not an official Remitly source of truth.

Last reviewed: 2026-05-23 America/Los_Angeles.

## Evidence

Reviewed surfaces:

- Public homepage: `https://www.remitly.com/us/en`
- Requested homepage URL: `https://www.remitly.com/us/en/homepage`
- Requested profile URL: `https://www.remitly.com/us/en/users/settings/profile`
- Supplied authenticated profile screenshot: `Screenshot_23-5-2026_172440_www.remitly.com profile setting.jpeg`

Observed access notes:

- `https://www.remitly.com/us/en` renders public marketing/send landing page.
- `https://www.remitly.com/us/en/homepage` redirected to login during review.
- `https://www.remitly.com/us/en/users/settings/profile` was reviewed after Auth0 email MFA. Live profile UI data was scrubbed to placeholders before being saved locally.
- Profile system anatomy below uses the live authenticated view, supplied screenshot, and public/auth page visual language. Do not reuse screenshot or account PII in generated designs.

Observed implementation signals:

- Main typeface: `GreycliffCF`, with fallbacks `"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- Font assets observed: `greycliffcf-bold-normal.woff2`, `greycliffcf-medium-normal.woff2`.
- Icon font observed: `orca-icons`.
- Core breakpoints observed: `576px`, `768px`, `992px`, `1200px`.
- Core component heights observed: `50px`, `54px`, `48px`, `38px` compact mobile nav/action.

## Agent Contract

Use this file as canonical local source before inventing Remitly UI.

Rules:

- Start with mobile layout, then enhance at breakpoints.
- Use tokens below; do not introduce new colors, radii, shadows, or typography unless explicitly marked exploratory.
- Prefer product UI over marketing flourish. Remitly UI is trust-heavy, dense enough for financial tasks, and plainspoken.
- Use real components below: nav, promo ribbon, country selector, card, form field, button, profile row, footer.
- Do not use gradients, decorative orbs, glassmorphism, oversized abstract illustrations, or unrelated fintech dashboard styles.
- Do not place PII in mockups. Use neutral placeholders like `Legal name`, `Street address`, `email@example.com`.
- Financial/identity flows must distinguish legal identity from editable profile/contact fields.
- Name changes are not simple text edits. Model as identity re-verification with status, documents, review, and support fallback.

## Design Principles

- Trust first: clear hierarchy, no hidden controls, no surprise transitions.
- Fast to scan: strong section labels, compact rows, visible dividers.
- Calm security: dark navy anchors critical flows; white surfaces hold forms.
- Mobile first: one-column stacks, full-width actions, 44px+ targets.
- Familiar over novel: pills, forms, list rows, side nav, footer columns.

## Tokens

### Color

```css
:root {
  /* Brand ink */
  --rmt-color-ink-900: #16273C;
  --rmt-color-ink-850: #19293A;
  --rmt-color-ink-800: #22354C;
  --rmt-color-ink-700: #2C415A;
  --rmt-color-ink-650: #344455;
  --rmt-color-ink-600: #3E5877;
  --rmt-color-ink-500: #425263;

  /* Text */
  --rmt-color-text: #242620;
  --rmt-color-text-subtle: #615F5A;
  --rmt-color-text-muted: #7E7C76;
  --rmt-color-text-inverse: #ffffff;

  /* Surface */
  --rmt-color-surface: #ffffff;
  --rmt-color-surface-warm: #FAF8F5;
  --rmt-color-surface-raised: #ffffff;
  --rmt-color-surface-subtle: #EFECE7;
  --rmt-color-surface-info: #E5F6F9;
  --rmt-color-surface-blue: #EEF3FE;
  --rmt-color-surface-blue-pressed: #D1DFF7;
  --rmt-color-surface-green: #EAF9CB;
  --rmt-color-surface-purple: #e7daf6;
  --rmt-color-surface-peach: #fff6ec;

  /* Border */
  --rmt-color-border-subtle: #E1DDD7;
  --rmt-color-border: #C5C2BC;
  --rmt-color-border-control: #c5ced8;
  --rmt-color-border-strong: #7E7C76;
  --rmt-color-border-focus: #41403B;

  /* Accent */
  --rmt-color-accent-purple: #743d95;
  --rmt-color-accent-teal: #04829E;
  --rmt-color-accent-teal-dark: #397882;
  --rmt-color-accent-teal-light: #73B6C0;
  --rmt-color-accent-teal-wash: #BFE6EC;
  --rmt-color-success: #42c888;
  --rmt-color-success-dark: #21613e;
  --rmt-color-danger: #ff5c52;
  --rmt-color-danger-border: #ff9a94;
  --rmt-color-danger-soft: #ffa9a8;
  --rmt-color-danger-text: #810d13;

  /* Social */
  --rmt-color-whatsapp: #25D366;
}
```

Semantic mapping:

| Token | Use |
| --- | --- |
| `--rmt-color-ink-900` | Hero/footer/navy bars, focus rings on light surfaces |
| `--rmt-color-ink-800` | Primary button hover, active nav backgrounds |
| `--rmt-color-ink-700` | Primary button default, selected dark CTA |
| `--rmt-color-text` | Main copy and headings on light surfaces |
| `--rmt-color-text-subtle` | Secondary copy, placeholders, helper text |
| `--rmt-color-surface-warm` | Page background bands and hover fills |
| `--rmt-color-surface-subtle` | Selected settings nav item and segmented active |
| `--rmt-color-accent-purple` | Promotional ribbon only |
| `--rmt-color-accent-teal` | Trust icons and secondary brand accents |
| `--rmt-color-danger` | Field error border and destructive warnings |

### Typography

```css
:root {
  --rmt-font-family: "GreycliffCF", "Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --rmt-font-weight-regular: 400;
  --rmt-font-weight-semibold: 600;
  --rmt-font-weight-bold: 700;

  --rmt-leading-tight: 1.2;
  --rmt-leading-body: 1.4;
  --rmt-leading-button: 1;
}
```

Type ramp:

| Name | Mobile | Tablet+ | Weight | Line | Use |
| --- | --- | --- | --- | --- | --- |
| `display-lg` | 40px | 44px | 600 | 1.2 | Rare large marketing title |
| `display-md` | 34px | 35px | 600 | 1.2 | Section hero title |
| `h1-mobile-home` | 32px / 37px | hidden on desktop homepage hero | 700 | fixed | Mobile homepage headline |
| `heading-lg` | 28px | 35px | 700 | 1.2 | Major section heading |
| `heading-md` | 23px | 28px | 700 | 1.2 | Card heading, form headline |
| `heading-sm` | 19px | 22px | 700 | 1.2 | Row group heading |
| `title` | 18px | 20px | 600 | 1.2 | Form/row titles |
| `body-lg` | 16px | 18px | 400 | 1.4 | Main body copy |
| `body` | 16px | 16px | 400 | 1.4 | Inputs, rows, nav |
| `caption` | 13px | 14px | 400 | 1.4 | Labels, legal, helper |
| `flag-label` | 12px | 12px | 400 | 14px | Country quick links |

### Spacing

Use 4px base with common Remitly steps:

```css
:root {
  --rmt-space-0: 0;
  --rmt-space-1: 2px;
  --rmt-space-2: 4px;
  --rmt-space-3: 6px;
  --rmt-space-4: 8px;
  --rmt-space-5: 12px;
  --rmt-space-6: 16px;
  --rmt-space-7: 20px;
  --rmt-space-8: 24px;
  --rmt-space-9: 32px;
  --rmt-space-10: 40px;
  --rmt-space-11: 48px;
  --rmt-space-12: 56px;
  --rmt-space-13: 64px;
  --rmt-space-14: 80px;
  --rmt-space-15: 96px;
}
```

Usage:

- Mobile page padding: `16px` minimum, `24px` preferred inside cards.
- Mobile section vertical padding: `32px`.
- Desktop section vertical padding: `56px` or `80px` for hero.
- Form field gap: `16px` to `24px`.
- Row divider padding: `24px` vertical on desktop profile settings.

### Radius

```css
:root {
  --rmt-radius-xxs: 1px;
  --rmt-radius-xs: 2px;
  --rmt-radius-sm: 3px;
  --rmt-radius-md: 4px;
  --rmt-radius-lg: 6px;
  --rmt-radius-xl: 8px;
  --rmt-radius-panel: 16px;
  --rmt-radius-modal: 24px;
  --rmt-radius-pill: 100px;
  --rmt-radius-circle: 50%;
}
```

Use:

- Cards and desktop selector: `8px`.
- Inputs/selects: `4px` or `6px`.
- CTAs and segmented controls: `100px`.
- Mobile stacked hero selector top/bottom card caps: `16px`.

### Elevation

```css
:root {
  --rmt-shadow-selector: 0px 5px 18px 3px rgba(0, 0, 0, 0.3);
  --rmt-shadow-menu: 0px 3px 6px 0px rgba(134, 150, 167, 0.5);
  --rmt-shadow-field-popover: 0 2px 8px 0 rgba(6, 25, 43, 0.15);
  --rmt-shadow-soft: 0 4px 6px rgba(0, 0, 0, 0.12);
}
```

Use shadows sparingly. Main profile/settings surfaces are mostly flat with borders and dividers.

### Breakpoints

```css
:root {
  --rmt-bp-xs-max: 575px;
  --rmt-bp-sm: 576px;
  --rmt-bp-md: 768px;
  --rmt-bp-lg: 992px;
  --rmt-bp-xl: 1200px;
}
```

Mobile-first media:

```css
@media (min-width: 576px) {}
@media (min-width: 768px) {}
@media (min-width: 992px) {}
@media (min-width: 1200px) {}
```

Do not create arbitrary breakpoints unless reproducing an observed exception.

### Sizing

```css
:root {
  --rmt-control-height: 50px;
  --rmt-control-height-compact: 38px;
  --rmt-button-height: 54px;
  --rmt-button-height-md: 48px;
  --rmt-icon-button-size: 40px;
  --rmt-flag-size: 24px;
  --rmt-logo-mark-mobile: 32px;
}
```

Touch targets:

- Minimum interactive target: `44px`.
- Compact nav buttons may render `38px` high only when surrounding target/padding keeps tap area usable.

### Focus

```css
:root {
  --rmt-focus-ring: 2px solid var(--rmt-color-ink-900);
  --rmt-focus-ring-inverse: 2px solid #ffffff;
  --rmt-focus-offset: 2px;
}
```

Rules:

- On light surfaces, focus ring uses `#16273C`.
- On dark navy surfaces, focus ring uses white.
- Inputs increase border to 2px on focus.
- Links and icon buttons must show visible focus, not color alone.

### Motion

Observed motion is functional, not expressive.

```css
:root {
  --rmt-motion-fast: 120ms;
  --rmt-motion-base: 200ms;
  --rmt-motion-nav: 500ms;
  --rmt-ease-standard: ease;
  --rmt-ease-nav: cubic-bezier(0.77, 0.2, 0.05, 1);
}
```

Use:

- Floating labels: `200ms`.
- Menu/hamburger transitions: `500ms var(--rmt-ease-nav)`.
- Avoid springy, playful, or bouncy motion in identity/payment flows.

## Components

### Global Navigation

Purpose: user context, product mode, destination/language, auth/account access.

Mobile:

- White header, logo mark left.
- Auth actions can appear at right as text/pill; keep within 390px width.
- Hamburger/menu button: `40px` circle with `#EFECE7` fill, three `#19293A` bars.
- Mobile menu is fixed right panel, width `100%`, max-width `576px`, white background, z-index high.

Desktop:

- White header, logo + wordmark left.
- Segmented control: Personal/Business in rounded pill border.
- Utility links inline: country, destination, language, help, login, sign up.
- Sign up button: navy pill.

States:

- Hover fill for menu/list item: `#FAF8F5`.
- Active fill: `#EFECE7`.
- Focus ring: `#16273C`.

### Promo Ribbon

Purpose: top promotion, above hero.

Anatomy:

- Full-width bar.
- Background `#743d95`.
- Text white, centered.
- Icon before text.
- Copy pattern: bold lead + regular continuation.

Mobile:

- Height follows content, avoid wrapping into more than two lines.
- Use `16px` horizontal padding.

Desktop:

- Center content with single-line text.

### Hero Country Selector

Purpose: first action for remittance flow.

Mobile anatomy:

- White page/nav then promo ribbon.
- Headline centered in black text, `32px/37px`, strong weight.
- Selector module becomes full-width navy stacked panel.
- Form header white, centered.
- Controls stacked with labels:
  - `Sending from:`
  - country select
  - `Sending to:`
  - country select
- CTA full width, pill, `54px`, navy lighter fill on navy card.
- Top destination quick links in horizontal row below CTA.
- Hero image appears after selector, not as split desktop layout.

Desktop anatomy:

- Navy hero band `#16273C`.
- Left headline and subcopy in white.
- Background image sits center/right with `8px` radius.
- Selector white card overlays image; `370px` wide by roughly `373px` high at xl.
- Selector shadow: `--rmt-shadow-selector`.
- Quick destination row below card/image within navy band.

Do:

- Keep selector title: "Where are you sending money to?"
- Use flag icons in circular `24px` containers.
- Use country labels exactly; do not abbreviate country names.

Do not:

- Turn selector into dashboard exchange-rate card unless task explicitly asks.
- Add decorative currency charts to core send flow.

### Button

Base:

```css
.rmt-button {
  align-items: center;
  border-radius: var(--rmt-radius-pill);
  box-sizing: border-box;
  display: inline-flex;
  font-family: var(--rmt-font-family);
  font-size: 16px;
  font-weight: 600;
  gap: 4px;
  justify-content: center;
  line-height: 1;
  min-height: 54px;
  padding: 16px 32px;
  text-decoration: none;
  white-space: nowrap;
}
```

Variants:

| Variant | Default | Hover | Active | Use |
| --- | --- | --- | --- | --- |
| Primary | bg `#2C415A`, text white | bg `#22354C` | bg `#16273C` | Main CTA |
| Primary compact | bg `#2C415A`, 48px min height, 12px/16px padding | bg `#22354C` | bg `#16273C` | Nav/form compact |
| Ghost | transparent, text `#2C415A` | bg `#EEF3FE`, text `#22354C` | bg `#D1DFF7`, text `#16273C` | Secondary action |
| Outline social | white, 2px navy border, text `#242620` | warm fill | pressed subtle | Login with provider |
| Destructive text | transparent, text `#810d13` | underline | underline | Close profile, delete-like actions |

Mobile:

- Use full width for primary form submits.
- Keep one primary per screen section.

### Form Field / Select

Use for text input, password, country selector, dropdown.

Base:

- Height `50px`.
- Background `#ffffff`.
- Text `#344455` for select values, `#242620` for normal input.
- Border `1px solid #c5ced8` or `#7E7C76`.
- Radius `4px` for homepage selector; `6px` for auth floating-label inputs.
- Padding `16px`; flag-leading controls use `40px` left padding when icon fixed.

States:

| State | Visual |
| --- | --- |
| Default | 1px border, white fill |
| Hover | unchanged or border strong |
| Focus | border `2px solid #41403B`, no default outline |
| Error | border `2px solid #ff5c52` or `#ff9a94`, helper in danger text |
| Disabled | opacity 0.4, not-allowed cursor |

Labels:

- Use visible labels outside fields in send selector.
- Auth input may use floating labels.
- Do not rely on placeholder-only labels.

### Segmented Control

Observed: Personal/Business nav switch.

Anatomy:

- Outer pill with border/subtle outline.
- Active segment fill `#EFECE7`.
- Text `16px`, semibold.
- Height roughly `48px`.
- Padding `12px 24px`.

Use only for peer choices. Do not use for primary CTA grouping.

### Country Quick Link

Anatomy:

- Circular flag, `24px`.
- Label below, white on navy.
- Text `12px/14px`.
- Column layout, centered.

Mobile:

- Horizontal scroll if list exceeds width.
- Preserve label readability; do not squeeze below 64px width.

Desktop:

- Spread evenly under hero card/image area.

### Trust Feature

Observed homepage section:

- Warm white background.
- Large centered heading.
- Three-column desktop layout.
- Teal icon above title.
- Title `19px/22px`, bold.
- Body `16px/18px`, centered.

Mobile:

- Stack features vertically.
- Keep icon-title-body rhythm; do not use cards unless repeated item needs a frame.

### Auth Form

Observed login:

- White full page.
- Logo mark centered top.
- Title "Welcome back" / "Sign in", centered.
- Input floating label, 6px radius, 1px navy/gray border, 50px height.
- Primary Continue button full width, navy pill.
- Secondary provider buttons full width, outline pill, provider icon left.
- Legal copy centered below, caption size, underline links.
- Horizontal OR divider between standard and provider login.

Mobile target:

- Content width: full viewport minus `32px` margins.
- Keep top spacing generous but not hero-like.
- Avoid background bands or cards.

### Settings Layout

Observed authenticated profile screenshot:

- Desktop header: Remitly wordmark left, primary nav links center, language/user menu right.
- Destination corridor bar: full-width navy strip with flag + country centered.
- Main content: side settings nav left, profile panel right.
- Page background: white.
- Profile panel: white card with light border, no heavy shadow.
- Footer: navy, multi-column links, app store badges, legal copy.

Desktop layout:

```css
.settings-shell {
  display: grid;
  grid-template-columns: 270px minmax(0, 650px);
  gap: 24px;
  justify-content: center;
  padding: 32px 24px 48px;
}
```

Mobile layout:

- Hide desktop side nav behind a "Settings" list/menu or show as stacked top list.
- Single column.
- Content panel becomes borderless or full-width with subtle dividers.
- Use sticky bottom action only when there is a pending save/cancel state.

### Settings Side Nav

Items observed:

- Profile information
- Notifications
- Contacts
- Payment methods
- Your privacy choices
- Legal resources
- Get Remitly Business with NEW badge

Visual:

- Active item background `#EFECE7`.
- Text `16px`, semibold for active.
- Vertical rhythm: `24px` item height area.
- Red `NEW` badge for business entry.

### Profile Information Panel

Observed row groups:

- Name
- Address with Edit
- Phone number with Edit
- Email address
- Password with Edit
- Language with Edit
- Sending to with Edit
- Sending from with helper link
- My Remitly / Close my profile

Panel anatomy:

```text
Panel
  H2 Profile information
  Row
    Label
    Value
    Optional Edit link aligned right
  Divider
```

Rules:

- `Name` appears read-only in observed screenshot, no Edit link.
- Editable contact/preferences show `Edit` link on right.
- Values are plain text; do not use input fields until row enters edit mode.
- Sensitive values like password show bullets.
- Close profile is destructive text, not a primary button.
- Use dividers between row groups; do not card each row.

Mobile profile pattern:

- Header: "Profile information".
- Rows become full width.
- `Edit` link remains right-aligned on row header line.
- Long values wrap below label with `16px` body text.
- Avoid showing full PII in generated examples.

### Footer

Observed:

- Navy background `#16273C`.
- Link text white/warm with underlines.
- Columns: Company, Products, Resources, Support, Connect.
- Large Remitly logo near lower section.
- App store badges centered/inline.
- QR code block.
- Legal copy centered small.

Mobile:

- Stack columns.
- Keep gaps large: `32px` to `64px`.
- Hide or move large logo if footer becomes too tall for task prototype.

## Identity Re-Verification Pattern

Use this pattern for legal name change concepts. It is a proposed extension that should still use observed Remitly components.

Do not model legal name as inline editable row. Use a governed flow:

1. Entry row: `Name` remains read-only; add contextual action `Request name change` only if product requirement asks for it.
2. Explain step: brief copy that name changes require identity verification for transfer security.
3. Evidence collection: updated government ID plus legal change document.
4. Review status: submitted, under review, approved, needs action.
5. Outcome: update legal name, rerun identity checks, show what changed.
6. Fallback: contact support/manual review.

Recommended screen stack:

- `Profile information`
- `Legal name`
- `Why we need this`
- `Documents needed`
- `Upload documents`
- `Review and submit`
- `Status`

Copy tone:

- Direct, calm, compliance-aware.
- Explain user benefit: transfer reliability and account security.
- Avoid legal overclaiming.

## Page Recipes

### Mobile Homepage Send Entry

```text
Header
PromoRibbon
CenteredHeadline
CountrySelectorPanel
  SelectorTitle
  Field: Sending from
  Field: Sending to
  PrimaryButton
  QuickCountryLinks
Image
TrustFeatureStack
Footer
```

Key specs:

- Header white.
- Selector panel navy with `16px` bottom radius.
- CTA full-width pill.
- Use `24px` side padding inside panel.

### Desktop Homepage Send Entry

```text
GlobalNav
PromoRibbon
HeroBand navy
  LeftCopy
  Image
  SelectorCard overlay
  QuickCountryLinks
TrustFeature 3 columns
Footer
```

Key specs:

- Hero band starts immediately after promo.
- Selector card is white, elevated, right side.
- Image has `8px` radius.

### Desktop Profile Settings

```text
GlobalNavAuthenticated
CorridorBar
SettingsShell
  SettingsSideNav
  ProfilePanel
Footer
```

Key specs:

- No hero treatment.
- No marketing imagery.
- Use bordered panel and dividers.
- Row actions are text links.

### Mobile Profile Settings

```text
AuthenticatedHeader
CorridorBar
SettingsTitle
ProfilePanel
  ProfileRows
Footer
```

Key specs:

- One column.
- Side nav collapses.
- Rows remain list-like.
- Do not put each profile field into a separate card.

## Accessibility

Minimum:

- Every input has a visible label.
- Every icon-only button has accessible name.
- Focus indicator visible on dark and light backgrounds.
- Tap targets at least `44px`.
- Link text must describe action; avoid bare "here".
- Error state uses color + text.
- Provider-login buttons include provider names in button text.
- Profile destructive action must not be adjacent to primary save without spacing and confirmation.

Contrast:

- White on `#16273C`, `#22354C`, `#2C415A`, and `#743d95` is acceptable for large UI text; verify exact contrast for small captions.
- Muted text `#7E7C76` should not carry critical information alone.

## Implementation Snippets

### CSS Foundation

```css
html {
  font-family: var(--rmt-font-family);
  color: var(--rmt-color-text);
  background: var(--rmt-color-surface);
}

body {
  margin: 0;
  font-size: 16px;
  line-height: var(--rmt-leading-body);
}

button,
input,
select,
textarea {
  font: inherit;
}

:focus-visible {
  outline: var(--rmt-focus-ring);
  outline-offset: var(--rmt-focus-offset);
}

.on-dark :focus-visible {
  outline: var(--rmt-focus-ring-inverse);
}
```

### Token JSON Seed

Use this block when an MCP agent needs a compact machine-readable seed.

```json
{
  "name": "Remitly reconstructed web design system",
  "version": "2026-05-23.review",
  "sourceConfidence": "high-for-observed-web-surfaces",
  "mobileFirst": true,
  "colors": {
    "ink900": "#16273C",
    "ink850": "#19293A",
    "ink800": "#22354C",
    "ink700": "#2C415A",
    "ink650": "#344455",
    "ink600": "#3E5877",
    "ink550": "#425263",
    "text": "#242620",
    "textSubtle": "#615F5A",
    "textMuted": "#7E7C76",
    "white": "#FFFFFF",
    "warm": "#FAF8F5",
    "subtle": "#EFECE7",
    "border": "#C5C2BC",
    "borderControl": "#C5CED8",
    "purplePromo": "#743D95",
    "teal": "#04829E",
    "tealDeep": "#397882",
    "tealSoft": "#BFE6EC",
    "success": "#42C888",
    "successDeep": "#21613E",
    "danger": "#FF5C52",
    "dangerDeep": "#810D13",
    "whatsapp": "#25D366"
  },
  "typography": {
    "family": "\"GreycliffCF\", \"Noto Sans\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
    "weights": [400, 600, 700],
    "scale": {
      "displayLg": {"mobile": 40, "desktop": 44, "weight": 600, "lineHeight": 1.2},
      "displayMd": {"mobile": 34, "desktop": 35, "weight": 600, "lineHeight": 1.2},
      "headingLg": {"mobile": 28, "desktop": 35, "weight": 700, "lineHeight": 1.2},
      "headingMd": {"mobile": 23, "desktop": 28, "weight": 700, "lineHeight": 1.2},
      "headingSm": {"mobile": 19, "desktop": 22, "weight": 700, "lineHeight": 1.2},
      "body": {"mobile": 16, "desktop": 18, "weight": 400, "lineHeight": 1.4},
      "caption": {"mobile": 13, "desktop": 14, "weight": 400, "lineHeight": 1.4}
    }
  },
  "breakpoints": {"sm": 576, "md": 768, "lg": 992, "xl": 1200},
  "spacing": [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96],
  "radii": {"sm": 4, "md": 6, "lg": 8, "panel": 16, "pill": 100},
  "shadows": {
    "selector": "0px 5px 18px 3px rgba(0, 0, 0, 0.3)",
    "menu": "0px 3px 6px 0px rgba(134, 150, 167, 0.5)",
    "popover": "0 2px 8px 0 rgba(6, 25, 43, 0.15)"
  },
  "components": [
    "GlobalNavigation",
    "PromoRibbon",
    "HeroCountrySelector",
    "Button",
    "FormField",
    "SegmentedControl",
    "CountryQuickLink",
    "TrustFeature",
    "AuthForm",
    "SettingsLayout",
    "SettingsSideNav",
    "ProfileInformationPanel",
    "Footer",
    "IdentityReverificationFlow"
  ]
}
```

## Anti-Patterns

Avoid:

- Purple/blue gradient hero backgrounds.
- Beige-only palette drift; warm surfaces must stay secondary.
- Floating cards inside cards.
- Dashboard analytics patterns for simple remittance/profile flows.
- Inline editable legal name field.
- Hidden labels or placeholder-only forms.
- Over-rounded cards beyond `8px` unless pill/button/modal.
- New icon styles if `orca-icons`/simple line icons are enough.
- Excessive animation in identity or payment contexts.

## Confidence

High confidence:

- Color tokens, typography family, breakpoints, button/input dimensions, homepage hero structure, auth form structure.

Medium confidence:

- Unobserved responsive/mobile settings state, because the live review focused on desktop authenticated profile anatomy.

Low confidence:

- Internal Remitly component names, exact Figma variable naming, unpublished mobile settings state.
