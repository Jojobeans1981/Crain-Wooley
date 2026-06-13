/*
 * Unified Scorpion 3rd-party-chrome hide-set — the SINGLE source of truth shared by
 * every capture/measurement path (band-gate.ts, aa-classifier.ts, any crop emitter).
 *
 * The original (estateplanningdfw.law) is a live Scorpion site; the clone legitimately
 * omits all Scorpion-injected chrome. To measure clone-vs-original fairly we hide that
 * chrome ON THE ORIGINAL in every band. It mounts NONDETERMINISTICALLY (instrument-bug
 * class #6 — overlay contamination), so a band's diff swings depending on whether the
 * widget happened to paint over it at screenshot time.
 *
 * Covered:
 *   #scorpion_connect          — the light-DOM host of the "How can we help?" webchat
 *                                overlay + the green "Connect"/"Text with Us" launcher
 *                                chip (its shadow root blocks .connect-page CSS, so the
 *                                HOST must be hidden, not the inner panel)
 *   .connect-page              — the webchat panel (when light-DOM)
 *   [class*="cta-tile/ctas-tiles"] — the Connect cta-tile launchers
 *   a[href*="scorpion.co"]     — the "SCORPION" footer attribution link/logo
 *
 * NOT hidden: #ScorpionFooterS4 (the legal disclaimer) — legitimate footer content the
 * clone mirrors; only Scorpion's own branding/widgets are stripped.
 */
export const SCORPION_HIDE_SELECTORS =
  '#scorpion_connect,.connect-page,[class*="cta-tile"],[class*="ctas-tiles"],a[href*="scorpion.co"]'

export const SCORPION_HIDE_CSS = `${SCORPION_HIDE_SELECTORS}{display:none!important}`
