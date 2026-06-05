# Accessibility Audit — Crain & Wooley (WCAG 2.1 AA)

**Status:** findings only — no application code was changed by this audit. Triage these, then write fix-PRs in the batches at the end.
**Date of analysis:** 2026-06-05. **Methodology:** automated (axe-core 4.x injected into the built+served app), manual code review, and computed color-contrast. Static analysis only — no live screen-reader pass (see *Limitations*).
**Re-run:** `node scripts/a11y-audit.mjs` (contrast) · `node scripts/a11y-audit.mjs --axe` (axe URL set + procedure).

---

## 1. Summary

The site is a literal clone of a Scorpion template restyled with our Stage-1 tokens, plus a custom intake flow. Two themes dominate:

1. **Color contrast** — the **gold `#9B8059`** token fails WCAG AA almost everywhere it carries text: gold-on-white (3.73:1) and white-on-gold (3.73:1) fail normal-text 4.5:1, and gold-on-slate (2.72:1) fails even the 3:1 UI/large bar. axe flagged contrast on **every** sampled page (search alone: 228 nodes). This is a **token-level, whole-site** issue — one fix sweeps hundreds of nodes.
2. **The intake flow** (where users actually transact) has the most *serious structural* problems: custom `<button>` controls faking radios/checkboxes with no role/state, labels not programmatically associated, and **silent validation** (errors are color-only, with no `aria-invalid`, no `aria-describedby`, no focus move, no live region). These live in two files (`primitives.tsx`, `IntakeFlow.tsx`) so they're also high-leverage.

### Counts by severity

| Severity | Count | Examples |
|---|---|---|
| **Critical** | 3 | Intake: unassociated labels, fake radio/checkbox controls (color-only state), silent validation |
| **Serious** | 11 | Contrast (gold×3 token pairings), mobile-drawer `aria-hidden-focus`/no trap, quiz result not announced, intake step focus + required + Select focus indicator, tracker status color-only |
| **Moderate** | 12 | Skip link missing, content outside landmarks, duplicate "Map & Directions" links, autoplay/carousel pause, heading hierarchy, target sizes, status-message live regions |
| **Minor** | 6 | Redundant image alt, gold-soft-on-gold chip count, fake-clickable footer `<p>`s, duplicate emblem name, progressbar role, ordered-list semantics |

### Counts by WCAG level

| Level | Count | Notes |
|---|---|---|
| **A** | ~18 | Name/Role/Value, labels, error identification, keyboard, landmarks, focus order, use-of-color |
| **AA** | ~14 | 1.4.3 contrast (the big one), 1.4.11 non-text contrast, 2.4.7 focus visible, 4.1.3 status messages, 2.5.8 target size |

### Method tags
- **[AUTO]** = caught by axe-core. **[MANUAL]** = code review / contrast math (axe catches ~30–40%; everything about keyboard operation, focus management, label *quality*, and "is this announced?" is MANUAL).

### What's already good (verified positives)
- `<html lang="en">` (`app/layout.tsx:71`); per-page `<title>` via `generateMetadata` on legacy, learn, persona, and search routes.
- **`prefers-reduced-motion` is broadly honored** — 6 guarded blocks in `globals.css`; `HeroVideo.tsx` renders a static poster (no autoplay) under reduced-motion; `Testimonials.tsx` disables auto-advance under reduced-motion.
- **Search** (`SiteSearch.tsx`) is the best-built surface: `role="search"`, labeled input, `aria-live` result count, chips are real `<button aria-pressed>`.
- Real landmark `<nav aria-label>` on breadcrumb, primary nav, footer, section sidebar; `aria-current` on active nav/breadcrumb items; decorative imagery correctly `alt=""` + `aria-hidden`.

---

## 2. Color contrast table (computed)

Ratios computed with the WCAG relative-luminance formula; rgba values alpha-composited over their real background first. Thresholds: normal text **4.5:1**, large text (≥18.66px bold / ≥24px) and UI/graphics **3:1**.

| Foreground | Background | Ratio | Normal 4.5 | Large/UI 3 | Real use |
|---|---|---|---|---|---|
| gold `#9B8059` | white `#FFFFFF` | **3.73:1** | ❌ FAIL | ✅ pass | inline links, eyebrow/section labels, card CTAs |
| gold `#9B8059` | off-white `#F7F7F7` | **3.48:1** | ❌ FAIL | ✅ pass | links/labels on legacy + search surfaces |
| gold `#9B8059` | slate `#304451` | **2.72:1** | ❌ FAIL | ❌ **FAIL** | nav hover, footer office headings, accents on slate |
| white `#FFFFFF` | gold `#9B8059` | **3.73:1** | ❌ FAIL | ✅ pass | **announcement bar**, gold buttons (Contact/Book/Drain now) |
| gold-soft `#D5C0A2` | gold `#9B8059` | **2.11:1** | ❌ FAIL | ❌ **FAIL** | chip count number on the active (gold) filter chip |
| gold-soft `#D5C0A2` | slate `#304451` | 5.74:1 | ✅ pass | ✅ pass | active nav item + breadcrumb links on slate |
| slate `#304451` | white `#FFFFFF` | 10.14:1 | ✅ pass | ✅ pass | headings + banner title |
| body `#3c4751` | white `#FFFFFF` | 9.49:1 | ✅ pass | ✅ pass | our legacy/intro body text |
| white `#FFFFFF` | slate `#304451` | 10.14:1 | ✅ pass | ✅ pass | nav links / banner H1 |
| nested `#56606a` | white `#FFFFFF` | 6.41:1 | ✅ pass | ✅ pass | sidebar depth-3 links |
| on-slate-mute white@.72 → `#c5cbce` | slate `#304451` | 6.18:1 | ✅ pass | ✅ pass | phone "Plano:" labels |
| flyout white@.85 → `#dfe2e3` | slate-deep `#283b46` | 8.94:1 | ✅ pass | ✅ pass | mega-menu flyout links |
| hero-sub white@.9 → `#eaecee` | slate `#304451` | 8.56:1 | ✅ pass | ✅ pass | hero subcopy |
| search-muted slate@.62 → `#7c8890` | off-white `#F7F7F7` | **3.39:1** | ❌ FAIL | ✅ pass | search result count, muted labels |
| search-placeholder slate@.5 → `#98a2a8` | white `#FFFFFF` | **2.60:1** | ❌ FAIL | ❌ FAIL | search input placeholder |

> The five **gold/low-alpha** failures are the whole-site contrast problem. The slate/white pairings are excellent. Note `#343434` (the generic "body" you named) on white is 12.45:1 — fine; our actual body is `#3c4751` (9.49:1, also fine). **Body text is not the problem; gold is.**

**Fix direction (token-level):** gold is fine for *large* text and as a *fill behind dark text*, but for **normal-size gold text** and **gold text/icons on slate** you need a darker gold for text (≈ `#7A6444` gives ~4.9:1 on white / ~3.0:1 on slate) — i.e. introduce a "gold-text" token and use it for links/labels/small UI, keeping `#9B8059` for fills/large display. For **white-on-gold** (announcement bar, buttons), either darken the gold fill or enlarge/bolden the text to clear the large-text bar. This is a Stage-1 token decision, not per-component.

---

## 3. Findings by surface

> Each finding: **severity** · WCAG SC (level) · where · problem/impact · fix · effort (S/M/L) · **GLOBAL** (template, one fix → many pages) or **page**. Method **[AUTO]/[MANUAL]**.

### 3.1 Global chrome — `components/site/SiteChrome.tsx` (GLOBAL: every page)

**CH-1 · Serious · 4.1.2 Name/Role/Value (A) · [AUTO]** — *Closed mobile drawer keeps focusable links (`aria-hidden-focus`).*
The off-canvas drawer is always in the DOM; when closed it's `aria-hidden={!drawerOpen}` (`SiteChrome.tsx:340`) but only translated off-screen (`translateX(-100%)`, still `display:block`), so its `<Link>`/`<button>` children remain in the tab order. axe flags `aria-hidden-focus` on **every** page. Keyboard/screen-reader users tab into invisible nav. **Fix:** when closed, remove the drawer subtree from the tab order (`display:none`, or `inert`/`hidden` attribute, or don't render children until open). **Effort S.** GLOBAL.

**CH-2 · Serious · 2.4.3 Focus Order (A) + 4.1.2 (A) · [MANUAL]** — *Drawer is `role="dialog" aria-modal="true"` but has no focus trap or focus management.*
On open (`SiteChrome.tsx:337-340`) focus is not moved into the dialog; Tab can leave it; on close focus isn't returned to the hamburger. `aria-modal="true"` *claims* modality that isn't enforced, which misleads AT. Escape-to-close exists (good). **Fix:** on open, focus the close button / first item; trap Tab within the drawer while open; restore focus to the toggle on close. **Effort M.** GLOBAL.

**CH-3 · Serious · 1.4.3 / 1.4.11 (AA) · [AUTO+MANUAL]** — *Announcement bar: white text on gold = 3.73:1 at ~15px (normal).* `SiteChrome.tsx:225-231` (`.cw-anno`). Fails AA for normal text. **Fix:** darken the gold or enlarge/bolden the bar text. **Effort S** (token). GLOBAL. (Same root as the gold buttons "Contact Us", and Stage-3 "Book a Consultation", Stage-6 "Drain now".)

**CH-4 · Serious · 1.4.11 Non-text Contrast (AA) · [MANUAL]** — *Nav hover/active accent is gold on slate = 2.72:1* (`.cw-nav-link:hover`, footer `.cw-office-name`, footer head underline). Fails the 3:1 UI bar, so the only indication of hover/section can be imperceptible to low-vision users. **Fix:** use the lighter `--cw-gold-soft #D5C0A2` (5.74:1 on slate) for gold-on-slate states instead of `#9B8059`. **Effort S** (token). GLOBAL.

**CH-5 · Moderate · 2.4.1 Bypass Blocks (A) · [MANUAL]** — *No skip-to-content link anywhere.* The header + full mega-menu precede content on every page; keyboard users must tab through ~40 nav links to reach main content. **Fix:** add a visually-hidden-until-focus "Skip to content" link as the first focusable element, targeting the `<main>`. **Effort S.** GLOBAL (site-wide).

**CH-6 · Moderate · 1.3.1 (A) / region (best practice) · [AUTO]** — *Announcement bar sits outside any landmark.* `.cw-anno` renders as a `<div>` before `<header>` (`SiteChrome.tsx:223`), so axe reports `region` (content not in a landmark) on every page. **Fix:** move it inside the `<header>` or wrap appropriately. **Effort S.** GLOBAL.

**CH-7 · Moderate · 2.4.4 Link Purpose (A) · [MANUAL]** — *Three identical "Map & Directions" links* in the footer (`SiteChrome.tsx`, `OFFICES.map`) have the same accessible name but different destinations. Screen-reader users listing links hear "Map & Directions" ×3. **Fix:** `aria-label="Map & Directions — Plano"` etc. **Effort S.** GLOBAL.

**CH-8 · Minor · 4.1.2 (A) · [MANUAL]** — *Mega-menu caret `aria-expanded` reflects only the click/JS state, not the CSS hover-open state* (`SiteChrome.tsx:164`). When a flyout is opened by hover/focus-within, `aria-expanded` can read `false`. Keyboard path works via focus-within, but state is inconsistent. **Fix:** drive open state from one source (JS) and reflect it in both CSS and `aria-expanded`. **Effort M.** GLOBAL.

### 3.2 Homepage — `components/site/home/*` (mostly page, hero/carousel reusable)

**HOME-1 · Moderate · 2.2.2 Pause, Stop, Hide (A) · [MANUAL]** — *Hero background video autoplays/loops with no pause control* (`HeroVideo.tsx`). Reduced-motion users get a poster (good), but users *without* that setting have a continuously moving background and no way to pause it. **Fix:** add a visible pause/play toggle, or treat the video as decorative and keep it very subtle. **Effort M.** Page (reusable component).

**HOME-2 · Moderate · 2.2.2 (A) · [MANUAL]** — *Testimonials carousel auto-advances (8s) with no explicit, always-available pause control* (`Testimonials.tsx`). It pauses on hover/focus and under reduced-motion (good), but 2.2.2 expects a user-operable pause mechanism that doesn't depend on hovering. Keyboard arrows + dots work (good). **Fix:** add a visible Pause/Play button. **Effort S.** Page.

**HOME-3 · Minor · H37 / image-redundant-alt (A) · [AUTO]** — *Service-card image `alt` duplicates the visible title* (`sections.tsx:204`, `alt={s.title}` next to the `<span>` title). axe `image-redundant-alt` ×3. **Fix:** `alt=""` on the card image since the title text is adjacent. **Effort S.** Page.

*(Positive: award-badge wall uses meaningful `alt` per credential — correct, not decorative; decorative band/divider images are `alt="" aria-hidden`.)*

### 3.3 Legacy article + sidebar — `components/legacy/LegacyArticle.tsx` (GLOBAL: 331 pages)

**LEG-1 · Moderate · 1.3.1 Info & Relationships (A) · [MANUAL]** — *Heading hierarchy can skip a level.* The banner renders `<h1>` (page title) and the body is reconstructed by matching blocks against the page's `h2s`/`h3s` arrays (`LegacyArticle.tsx`). If a captured page's first sub-heading is an H3 (no preceding H2), the output is `h1 → h3` (skips h2). Likely on some of the 331 pages. **Fix:** when reconstructing, demote/normalize so levels never skip (track the last emitted level). **Effort M.** GLOBAL.

**LEG-2 · Serious · 1.4.3 (AA) · [AUTO]** — *Inline body links are gold on white = 3.73:1* (`.learn-article a`, the Stage-4 gold link treatment). 11 contrast nodes on `/estate-planning/trusts`. Same token root as CH-3/CH-4. **Fix:** gold-text token. **Effort S** (token). GLOBAL.

*(Positive: breadcrumb is `<nav aria-label="Breadcrumb">` with `aria-current="page"`; the section sidebar is `<nav aria-label="Section">` with `aria-current`; mobile sidebar uses a native keyboard-operable `<details>`.)*

### 3.4 Learn hub + pillar + quiz — `app/(learn)/*`, `components/learn/QuizRunner.tsx`

**QUIZ-1 · Serious · 4.1.3 Status Messages (AA) + 2.4.3 (A) · [MANUAL]** — *Quiz result is not announced and focus isn't moved.* On completion `QuizRunner.tsx:137` renders `<h1>{result.headline}</h1>` with no `aria-live`/`role="status"` and no focus move. A screen-reader user finishing the quiz hears nothing — the entire payoff is silent. **Fix:** render the result in a `role="status"` region and/or move focus to the result `<h1>` (`tabIndex={-1}` + `.focus()`). **Effort S.** Affects all 3 quizzes (GLOBAL to QuizRunner).

**QUIZ-2 · Moderate · 4.1.3 (AA) / 2.4.3 (A) · [MANUAL]** — *Question-to-question transitions don't move focus or announce the new prompt* (`QuizRunner.tsx:90`). Each step is a fresh `<h1>` but focus stays on the just-clicked option. **Fix:** focus the new prompt on step change. **Effort S.** GLOBAL (QuizRunner).

**QUIZ-3 · Minor · 1.3.1 (A) · [MANUAL]** — *Progress bar is `aria-hidden` with no programmatic progress* (`QuizRunner.tsx:82`). **Fix:** add `role="progressbar"` `aria-valuenow/min/max`, or a visually-hidden "Question 3 of 7". **Effort S.** GLOBAL (QuizRunner).

**LEARN-1 · Serious · 1.4.3 (AA) · [AUTO]** — Hub eyebrows/`learn-card-cta`/quiz band use gold text on light/dark → contrast (13 nodes `/learn`, 12 `/learn/quizzes/*`). Token root. GLOBAL.

### 3.5 Search — `components/search/SiteSearch.tsx`

**SEARCH-1 · Serious · 1.4.3 (AA) · [AUTO]** — *Highest contrast count on the site: 228 nodes on `/site-search?q=trust`.* Driven by the gold `resultSection` labels and gold result titles/links over white across ~110 result rows, plus the muted result count (3.39:1) and the gold-soft chip count on the active gold chip (2.11:1). All token-root. **Fix:** gold-text token + darken muted (`search-muted`/placeholder). **Effort S** (token), but big payoff. GLOBAL.

*(Positive: `role="search"`, `<label htmlFor>`, `aria-live` count, `aria-pressed` chips, keyboard — this surface is otherwise model.)*

### 3.6 Persona landing — `app/(marketing)/learn/for/[persona]/page.tsx`

**PERS-1 · Serious · 1.4.3 (AA) · [AUTO]** — 30 contrast nodes (gold breadcrumb + gold `learn-readlist` links). Token root. GLOBAL. *(Landmarks/headings/`<nav>` groups are correct.)*

### 3.7 Blog — `app/(marketing)/blogs/*`, `components/legacy/BlogList.tsx`

**BLOG-1 · Serious · 1.4.3 (AA) · [AUTO]** — 19 contrast nodes (gold year counts + gold post links). Token root. GLOBAL. Blog posts render via `LegacyArticle` (inherits LEG-1/LEG-2).

### 3.8 Intake flow — the transaction path (audit-priority)

Full detail in the per-finding list below; these are the highest-impact for real users. **All of G1–G15 are GLOBAL** to the intake (they live in `primitives.tsx` / `IntakeFlow.tsx`, used by every step and both Wills/Probate branches). Mostly **[MANUAL]** — axe only caught 1 contrast node on `/qualify` because the failures are *semantic* (missing roles/labels/associations), which automated tools can't see.

| ID | Sev | WCAG (level) | Where | Problem → fix | Effort | Scope |
|---|---|---|---|---|---|---|
| **G1** | **Critical** | 1.3.1, 4.1.2, 3.3.2 (A) | `primitives.tsx:24-37` `Field` | Label `<label>` wraps the label span + control + hint/error and has no `htmlFor`; non-native controls get **no accessible name**. → `useId()`, real `htmlFor`/`aria-labelledby`, pass id to control. | M | GLOBAL |
| **G2** | **Critical** | 4.1.2, 1.3.1, 1.4.1 (A) | `primitives.tsx:76-113,154-208` RadioCard/YesNo/TriOption | `<button>`s with **no `role="radio"`/`aria-checked`/radiogroup**; selected state is **color-only**. → real radiogroup + roving tabindex, or hidden native `<input type=radio>`. | M–L | GLOBAL |
| **G3** | **Critical** | 4.1.2, 1.3.1, 1.4.1 (A) | `primitives.tsx:115-152` CheckCard | `<button>` faking checkbox, no `role/aria-checked`, color-only. → `role="checkbox"`+`aria-checked` or native checkbox. | S–M | GLOBAL |
| **G4** | **Serious→Critical** | 3.3.1 (A), 3.3.3, 4.1.3 (AA), 2.4.3 (A) | `IntakeFlow.tsx:176-189`; `primitives.tsx:33` | **Silent validation**: errors are color + "· please complete" only — no `aria-invalid`, no `aria-describedby`, no focus move, no live summary. Users get no feedback on Continue. → associate errors, set `aria-invalid`, move focus to first error, add `role="alert"` summary. | M | GLOBAL |
| **G5** | Serious | 3.3.2, 1.3.1 (A) | `primitives.tsx:32` | "required" is a visual badge only; `required`/`aria-required` never set. → forward `aria-required`. | S | GLOBAL |
| **G6** | Serious | 2.4.7, 1.4.11 (AA) | `primitives.tsx:210-232` Select (+ Input/Textarea) | `outline:none`; `Select` adds **no** focus indicator; inputs use a faint JS shadow. → visible `:focus-visible` ring ≥3:1. | S | GLOBAL |
| **G7** | Serious | 2.4.3 (A), 4.1.3 (AA) | `IntakeFlow.tsx:188,192,277` | Step change doesn't move focus to the new step heading or announce "Section N of M". → focus `<h2>` on step change; `aria-live` the progress. | M | GLOBAL |
| **G8** | Moderate | 4.1.2, 1.4.1 (A) | `IntakeFlow.tsx:272-292` | Current step indicated by weight/color only (no `aria-current="step"`); future steps hard-`disabled`. → `aria-current`. | S | GLOBAL |
| **G9/G10** | Moderate | 4.1.3 (AA), 3.3.1 (A) | `IntakeFlow.tsx:257-264,347-351` | Autosave "Saved …" and submit-error / pop-up messages not in live regions; submit lacks `aria-busy`. → `aria-live`/`role="alert"`. | S | GLOBAL |
| **G11** | Serious | 1.4.3 (AA) | `lib/cf.ts` brass `#9A825E` | Intake brass text (required badge, eyebrows, "Edit" links) ≈ 3.4:1 on white. → use a darker brass for text. | S | GLOBAL |
| **G12** | Moderate | 2.5.8 (AA) | `primitives.tsx:335-339,387-388`; `steps.tsx:845-848` | "Remove"/"×"/"Edit"/progress chips < 24×24. → pad to ≥24×24. | S | GLOBAL |
| **G14** | Moderate | 1.3.1, 2.4.6 (A/AA) | `IntakeFlow.tsx:299`; `steps.tsx:376,844` | Heading levels skip (h2 → h4 in review; key-people section titles are `<span>` not headings). → real `<h3>`s. | S | GLOBAL |
| **G15** | Moderate | 2.4.1, 1.3.1 (A) | `app/(intake)/layout.tsx`; emblem in each page | Intake has **no `<main>`** (axe: `landmark-one-main` + `region`×22 on `/get-started`) and no skip link; logo emblem `role="img" aria-label` duplicates the wrapping link's name. → add `<main>`+skip link; `aria-hidden` the inner emblem. | S–M | GLOBAL |
| **R1** | Serious | 2.4.3 (A), 2.4.4 (A), 1.4.3 (AA) | `steps.tsx:840-867`; `IntakeFlow.tsx:112-117` | Review "Edit" jumps step with no focus move (focus lost to `<body>`); every button is just "Edit"; brass text low-contrast. → focus target heading; `aria-label="Edit {section}"`. | M | GLOBAL |
| **P1** | Moderate | 4.1.2, 2.4.1 (A) | `schedule/page.tsx:145-172` | Cal.com scheduler region has no heading/label; when the real `<iframe>` lands it needs a `title`. → label the region; ensure iframe `title` + no focus trap. | S/M | page |
| **P2** | Moderate | 4.1.3 (AA), 1.1.1 (A) | `schedule/page.tsx:36-73` | "Verifying payment…" spinner not in a live region; spinner `animate-pulse` not reduced-motion-gated. → `role="status"`; gate pulse. | S | page |
| **P4** | Moderate | 4.1.3 (AA), 3.3.1 (A) | `payment/page.tsx:64-68,114-118` | Cancelled/error banners not `role="alert"`; pay button no `aria-busy`. → add. | S | page |
| **P5** | Serious | 1.4.1 (A), 1.3.1, 4.1.2 (A) | `tracker/[leadId]/page.tsx:101-144` | Case-progress stages convey completed/current/upcoming by **color/opacity only** — no text status, no `aria-current="step"`. The tracker's whole point is invisible to AT. → add visually-hidden status text + `aria-current`; mark icons `aria-hidden`; use an `<ol>`. | M | page |
| **P8/P9** | Minor/Mod | 2.4.4 (A), 1.4.3 (AA), 2.4.3 (A) | `confirmation/page.tsx` | New-tab referral link unmarked; numbered steps are `<div>`s not `<ol>`; terminal screen doesn't focus its `<h1>`. → "(opens in new tab)", `<ol>`, focus heading. | S | page |
| **P10** | Minor | 4.1.2, 2.1.1, 1.4.1 (A) | `get-started/page.tsx:955-974` | Footer practice-area items are `cursor:pointer` `<p>`s — look clickable, aren't keyboard-operable. (Also a content bug: literal `—` strings render at `:510`.) → real links or drop the affordance. | S | page |

### 3.9 Site-wide

- **Skip link** — missing (CH-5). **A.**
- **`<main>` landmark** — present on marketing/learn layouts; **missing on the intake layout** (G15). **A.**
- **Focus visible** — public Stage-1 components mostly add `:focus-visible` outlines; **intake strips outlines** (G6). **AA.**
- **Unique titles** — OK on public routes; verify the intake pages set distinct `<title>`s (currently generic). **A. [MANUAL]**
- **Target size** — intake controls (G12) + verify mobile nav/footer tap targets ≥24×24. **AA.**
- **Motion** — well-handled for CSS + hero/carousel; remaining gaps are explicit *pause controls* (HOME-1/2) and ungated `animate-pulse` on intake status dots (P2/P3). **A.**

---

## 4. Prioritized fix plan (fix-PR batches)

Ordered by leverage (pages fixed per hour) × severity. Each batch is one reviewable PR.

1. **Batch A — Contrast tokens (Serious, AA, whole-site, S effort, huge payoff).**
   Introduce a `--cw-gold-text` (≈`#7A6444`) for normal-size gold text/links/icons and gold-on-slate states; darken the announcement-bar/button text-vs-fill relationship; bump `search-muted`/placeholder alphas. Fixes CH-3, CH-4, LEG-2, LEARN-1, SEARCH-1, PERS-1, BLOG-1, G11 — i.e. **hundreds of axe nodes across every page** in one PR. *Highest priority: most failures, least code.*
2. **Batch B — Intake forms semantics (Critical, A, GLOBAL).**
   `primitives.tsx` + `IntakeFlow.tsx`: associate labels (G1), real radio/checkbox semantics + keyboard (G2/G3), `aria-required` (G5), and **error association + focus + live summary** (G4). This is the transaction path — do it before launch. Also G6 (focus rings), G7/R1 (step + edit focus), G8–G10, G14.
3. **Batch C — Chrome keyboard + drawer (Serious, A, GLOBAL).**
   Fix `aria-hidden-focus` (CH-1) + drawer focus trap/return (CH-2); add the **skip link** (CH-5) and move the announcement bar into a landmark (CH-6); disambiguate footer map links (CH-7); reconcile caret `aria-expanded` (CH-8).
4. **Batch D — Status messages & dynamic state (Serious/Moderate, A/AA).**
   Quiz result + step announce/focus (QUIZ-1/2); tracker status text + `aria-current` (P5); schedule/payment live regions (P2/P4); confirmation focus + `<ol>` (P8/P9); intake autosave/submit live (G9/G10).
5. **Batch E — Media & misc (Moderate/Minor).**
   Hero/carousel pause controls (HOME-1/2); redundant alt (HOME-3); legacy heading normalization (LEG-1); intake `<main>` + emblem dedupe (G15); target sizes (G12); get-started fake-link `<p>`s + `—` bug (P10).

---

## 5. Limitations — what a live screen-reader pass still needs

This audit is **static** (code + computed contrast + automated axe on rendered DOM). It did **not** include live assistive-technology testing. Before sign-off, a manual pass with **NVDA + Firefox, JAWS + Chrome, and VoiceOver + Safari (incl. iOS)** should verify:
- The **intake radio/checkbox** announcements and arrow-key navigation after the Batch-B fixes (the exact name/role/state computation).
- **Focus order** through the mega-menu flyouts and the mobile drawer (open → trap → close → restore).
- That **validation errors** are actually announced and focus lands on the first error (G4) — automated tools cannot confirm the spoken experience.
- The **quiz result** and **tracker status** are spoken on update (QUIZ-1, P5).
- The **Cal.com embed** (P1) once integrated — third-party iframe a11y, focus, and whether it traps.
- **Reflow/zoom to 400%** (1.4.10) and **text spacing** (1.4.12) — not covered here.
- **Real reduced-motion** behavior on device, and that the **hero video** doesn't autoplay with sound anywhere.

Automated tools caught the contrast + `aria-hidden-focus` + landmark issues (~30–40% of findings); **everything about keyboard operation, focus management, label quality, and "is it announced?" came from manual review** and must be confirmed with AT.
