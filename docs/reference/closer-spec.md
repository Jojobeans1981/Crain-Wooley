# Closer-band spec (baseline-derived) — for the shared rebuild (path b)

**Verification:** closer bands are IDENTICAL on homepage and interior (same
section ids/classes/computed styling). Build ONE faithful set, share across both.
The existing homepage ValueProps/ReviewsSection/Locations are NOT the reference.

## Band 1 — pillars / testimonials (`section#ImageGroupS1.img-grp s1 dk-bg bg-image`)
- bg: gold `rgb(155,128,89)` fallback BEHIND a script-handwriting watermark
  background-image (lazy-loaded in baseline; same family as the banner watermark).
- eyebrow: "DESIGNED FOR YOUR COMFORT" (some pages "Estate Planning With Us Means").
- content: testimonial quotes carousel — quote + attribution, e.g.
  `"Thank you and God Bless you" — Donna V.`, `"Very much appreciated" — Sarah P.`,
  `"Smooth and easy" — Anonymous`, `"Professional and knowledgeable" — Susan X.`
  (per-page curated; pull from each baseline at extract time).

## Band 2 — schedule (`section#CTAsS1.cta s1 pd_v dk-bg alt-bg`)
- bg: navy slate `rgb(48,68,81)` (#304451); padding-top ~106px (tall band).
- heading: "Schedule a Consultation Today!"
- three location cards: **Plano** (Contact Us → `/plano-contact-us/`),
  **Mansfield** (Contact Us → `https://outlook.office.com/book/CrainWoo…`),
  **Ft Worth** (Contact Us → `https://outlook.office.com/book/CrainWoo…`).
  Outlook booking links are external (open in new tab).

## Build plan (next session)
1. Extract per-page closer content (testimonial quotes, location cards) into the
   FamilyBData model (the schedule cards are largely shared; quotes may vary).
2. Build `InteriorClosers` component set styled from baseline computed tokens
   (gold+watermark pillars/testimonials band; navy-slate schedule band w/ 3 cards).
   Capture the watermark + any band assets (courteous).
3. Replace closers on BOTH FamilyBPage and the homepage with this set.
4. Re-run the pixel trio; iterate banner/badge (18-20%) + body (4-5%) residuals
   per baseline computed styles. Freeze the badge carousel (reduced-motion) rather
   than mask. Target <1% at 1440/768/390. Homepage pixel run informational.
