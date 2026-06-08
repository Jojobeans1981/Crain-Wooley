const pptxgen = require("pptxgenjs");

const p = new pptxgen();
p.defineLayout({ name: "CW", width: 13.333, height: 7.5 });
p.layout = "CW";
p.author = "FutureEng";
p.company = "FutureEng";
p.title = "Crain & Wooley — Automated Intake Engine — Build Status";

// ── Brand palette (vault-dark) ──
const C = {
  void: "0B0D11", panel: "111318", wall: "1A1D24", border: "2A2D35",
  steel: "6B7B8E", parch: "E8E2D6", gold: "C5933A", goldmute: "8A6422",
  warn: "D95D39", safe: "3A7D5A", sky: "5B7C99",
};
const F = { disp: "Georgia", mono: "Consolas", body: "Calibri" };
const W = 13.333, M = 0.6;

function slide() { const s = p.addSlide(); s.background = { color: C.void }; return s; }

function footer(s, n) {
  s.addText("CRAIN · WOOLEY  —  FUTUREENG", { x: M, y: 7.04, w: 8, h: 0.3, fontFace: F.mono, fontSize: 8, color: C.steel, charSpacing: 2 });
  s.addText(String(n).padStart(2, "0") + " / 12", { x: W - M - 1.6, y: 7.04, w: 1.6, h: 0.3, fontFace: F.mono, fontSize: 8, color: C.steel, align: "right", charSpacing: 1 });
}

function header(s, kicker, title) {
  s.addShape(p.shapes.RECTANGLE, { x: M, y: 0.66, w: 0.13, h: 0.13, fill: { color: C.gold } });
  s.addText(kicker, { x: M + 0.27, y: 0.57, w: 11.5, h: 0.32, fontFace: F.mono, fontSize: 11, color: C.gold, charSpacing: 3 });
  s.addText(title, { x: M - 0.02, y: 0.95, w: W - 2 * M, h: 0.85, fontFace: F.disp, fontSize: 33, color: C.parch, bold: true });
}

function panel(s, x, y, w, h, fill) {
  s.addShape(p.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || C.panel }, line: { color: C.border, width: 1 } });
}

// square-marker rows
function rows(s, x, y, items, opt) {
  opt = opt || {};
  const step = opt.step || 0.52, w = opt.w || 5.0, fs = opt.fs || 14;
  let yy = y;
  items.forEach((it) => {
    const sqc = it.c || C.gold;
    s.addShape(p.shapes.RECTANGLE, { x, y: yy + 0.06, w: 0.12, h: 0.12, fill: { color: sqc } });
    s.addText(it.t, { x: x + 0.28, y: yy - 0.05, w, h: opt.h || 0.5, fontFace: F.body, fontSize: fs, color: it.tc || C.parch, valign: "top" });
    yy += step;
  });
}

// ───────────────────────── Slide 1 — Title ─────────────────────────
(() => {
  const s = slide();
  s.addShape(p.shapes.RECTANGLE, { x: M, y: 1.95, w: 0.16, h: 0.16, fill: { color: C.gold } });
  s.addText("ESTATE LAW · AUTOMATED CLIENT INTAKE", { x: M + 0.32, y: 1.88, w: 11, h: 0.34, fontFace: F.mono, fontSize: 12, color: C.gold, charSpacing: 4 });
  s.addText("Crain & Wooley", { x: M - 0.04, y: 2.35, w: 12, h: 1.5, fontFace: F.disp, fontSize: 72, color: C.parch, bold: true });
  s.addText("Automated Intake Engine", { x: M, y: 3.75, w: 12, h: 0.7, fontFace: F.disp, fontSize: 30, italic: true, color: C.gold });
  s.addText("Build status & path to launch", { x: M, y: 4.55, w: 12, h: 0.5, fontFace: F.body, fontSize: 16, color: C.steel });
  s.addText("Prepared by FutureEng  —  Haron Wilson & Joseph Panetta        May 20, 2026", { x: M, y: 6.5, w: 12, h: 0.4, fontFace: F.mono, fontSize: 10, color: C.steel, charSpacing: 1 });
})();

// ───────────────────────── Slide 2 — Problem ─────────────────────────
(() => {
  const s = slide();
  header(s, "THE SITUATION TODAY", "People-driven, with tech support");
  const stats = [
    ["3", "intake staff"],
    ["<100", "consults / month"],
    ["5+", "manual touches per lead"],
    ["0", "steps fully automated"],
  ];
  const cw = 2.83, gap = 0.31;
  let x = M;
  stats.forEach(([num, lab]) => {
    panel(s, x, 2.45, cw, 2.15, C.panel);
    s.addText(num, { x: x, y: 2.7, w: cw, h: 1.1, fontFace: F.disp, fontSize: 56, color: C.gold, bold: true, align: "center" });
    s.addText(lab, { x: x + 0.15, y: 3.85, w: cw - 0.3, h: 0.55, fontFace: F.mono, fontSize: 12, color: C.parch, align: "center", charSpacing: 1 });
    x += cw + gap;
  });
  s.addText([
    { text: "“Even automations in Clio require human assistance.”", options: { italic: true, color: C.parch } },
    { text: "   Lead in → human responds → human qualifies → human schedules → human chases. That is the bottleneck.", options: { color: C.steel } },
  ], { x: M, y: 5.25, w: W - 2 * M, h: 1.0, fontFace: F.body, fontSize: 15 });
  footer(s, 2);
})();

// ───────────────────────── Slide 3 — Goal ─────────────────────────
(() => {
  const s = slide();
  header(s, "THE GOAL", "System-driven, with people support");
  panel(s, M, 2.45, 4.0, 3.9, C.panel);
  s.addText("100", { x: M, y: 2.9, w: 4.0, h: 1.4, fontFace: F.disp, fontSize: 84, color: C.gold, bold: true, align: "center" });
  s.addText("scheduled consults\nevery month", { x: M, y: 4.35, w: 4.0, h: 1.2, fontFace: F.body, fontSize: 16, color: C.parch, align: "center" });
  s.addText("The four questions that define success:", { x: 5.1, y: 2.5, w: 7.5, h: 0.4, fontFace: F.mono, fontSize: 12, color: C.gold, charSpacing: 2 });
  rows(s, 5.1, 3.05, [
    { t: "A lead reaches a scheduled consult with no staff touch" },
    { t: "Every lead gets a response within 60 seconds" },
    { t: "A hired client is onboarded within 1 hour" },
    { t: "No duplicate data entry across systems" },
  ], { step: 0.78, w: 7.6, fs: 17 });
  footer(s, 3);
})();

// ───────────────────────── Slide 4 — Four engines ─────────────────────────
(() => {
  const s = slide();
  header(s, "WHAT WE BUILT", "Four engines, one client journey");
  const cards = [
    ["01  Intake Gate", "Logic-driven web forms that capture, qualify, and route every lead automatically — no staff triage."],
    ["02  Payment Bridge", "The $300 consult fee is collected up front, before any calendar slot is held."],
    ["03  Ghost Assistant", "Instant reply, then Day 1 / 2 / 4 SMS & email follow-ups. Auto-stops the moment they pay or opt out."],
    ["04  Onboarding Accelerator", "On hire, auto-creates the Clio contact, opens the matter, and seeds the task list."],
  ];
  const cw = 5.85, ch = 1.95, gx = 0.43, gy = 0.32;
  const xs = [M, M + cw + gx], ys = [2.05, 2.05 + ch + gy];
  cards.forEach((c, i) => {
    const x = xs[i % 2], y = ys[Math.floor(i / 2)];
    panel(s, x, y, cw, ch, C.panel);
    s.addShape(p.shapes.RECTANGLE, { x: x, y: y, w: 0.09, h: ch, fill: { color: C.gold } });
    s.addText(c[0], { x: x + 0.32, y: y + 0.22, w: cw - 0.6, h: 0.5, fontFace: F.mono, fontSize: 15, color: C.gold, bold: true, charSpacing: 1 });
    s.addText(c[1], { x: x + 0.32, y: y + 0.78, w: cw - 0.6, h: 1.0, fontFace: F.body, fontSize: 14, color: C.parch, valign: "top" });
  });
  footer(s, 4);
})();

// ───────────────────────── Slide 5 — Journey flow ─────────────────────────
(() => {
  const s = slide();
  header(s, "THE AUTOMATED JOURNEY", "From first click to open matter");
  const nodes = ["Inquiry", "Qualify", "Pay $300", "Schedule", "Hire", "Clio Matter & Tasks"];
  const nw = 1.7, ny = 2.45, nh = 1.15;
  let x = M;
  const step = (W - 2 * M - nw) / (nodes.length - 1);
  nodes.forEach((n, i) => {
    panel(s, x, ny, nw, nh, C.wall);
    s.addText(n, { x: x + 0.05, y: ny, w: nw - 0.1, h: nh, fontFace: F.body, fontSize: 12.5, color: C.parch, align: "center", valign: "middle", bold: true });
    if (i < nodes.length - 1) {
      s.addText("›", { x: x + nw, y: ny, w: step - nw, h: nh, fontFace: F.disp, fontSize: 26, color: C.gold, align: "center", valign: "middle" });
    }
    x += step;
  });
  panel(s, M, 4.35, W - 2 * M, 1.7, C.panel);
  s.addShape(p.shapes.RECTANGLE, { x: M, y: 4.35, w: 0.09, h: 1.7, fill: { color: C.gold } });
  s.addText("GHOST ASSISTANT RUNS IN PARALLEL", { x: M + 0.32, y: 4.58, w: 11.8, h: 0.4, fontFace: F.mono, fontSize: 12, color: C.gold, charSpacing: 2 });
  s.addText("If they don’t book right away: instant confirmation email → Day 1 SMS → Day 2 email → Day 4 final nudge — each carrying their payment + scheduling link. The sequence cancels itself the moment they pay, book, or reply STOP.", { x: M + 0.32, y: 5.02, w: 11.7, h: 0.9, fontFace: F.body, fontSize: 14, color: C.parch, valign: "top" });
  footer(s, 5);
})();

// ───────────────────────── Slide 6 — Estate-specialized ─────────────────────────
(() => {
  const s = slide();
  header(s, "ESTATE-SPECIALIZED", "Speaks estate law, not generic law");
  s.addText("Practice areas the intake offers", { x: M, y: 2.4, w: 5.6, h: 0.4, fontFace: F.mono, fontSize: 12, color: C.gold, charSpacing: 2 });
  rows(s, M, 2.95, [
    { t: "Estate Planning — wills, trusts, POA, directives" },
    { t: "Probate & Estate Administration" },
    { t: "Trust Administration" },
    { t: "Guardianship & Conservatorship" },
    { t: "Elder Law — Medicaid / long-term care" },
  ], { step: 0.62, w: 5.7, fs: 15 });
  panel(s, 6.7, 2.3, W - M - 6.7, 3.95, C.panel);
  s.addText("Qualification tuned for estate", { x: 7.0, y: 2.55, w: 5.4, h: 0.4, fontFace: F.mono, fontSize: 12, color: C.gold, charSpacing: 2 });
  rows(s, 7.0, 3.1, [
    { t: "A client “just planning ahead” qualifies — not dismissed as a weak lead" },
    { t: "Non-estate inquiries route out automatically" },
    { t: "Low-intent / DIY / free-advice requests are filtered" },
    { t: "Staff can override any decision by hand" },
  ], { step: 0.8, w: 5.3, fs: 14 });
  footer(s, 6);
})();

// ───────────────────────── Slide 7 — Litmus ─────────────────────────
(() => {
  const s = slide();
  header(s, "DOES IT DELIVER?", "Measured against the firm’s own yardstick");
  const items = [
    ["Instant response within 60 seconds", "Yes — confirmation fires immediately", C.safe],
    ["Lead → scheduled consult without staff", "Yes — once integrations are live", C.safe],
    ["Client progress tracker (“Domino’s-style”)", "Built", C.safe],
    ["TCPA opt-out / STOP compliance", "Built", C.safe],
    ["Hired client onboarded within 1 hour", "Ready — needs Clio connection", C.gold],
    ["No duplicate data entry", "On Clio connection", C.gold],
  ];
  let y = 2.15;
  items.forEach(([label, status, col]) => {
    panel(s, M, y, W - 2 * M, 0.66, C.panel);
    s.addShape(p.shapes.RECTANGLE, { x: M + 0.25, y: y + 0.25, w: 0.16, h: 0.16, fill: { color: col } });
    s.addText(label, { x: M + 0.62, y: y, w: 7.2, h: 0.66, fontFace: F.body, fontSize: 15, color: C.parch, valign: "middle" });
    s.addText(status, { x: 8.4, y: y, w: W - M - 8.6, h: 0.66, fontFace: F.mono, fontSize: 12, color: col, valign: "middle", align: "right", charSpacing: 1 });
    y += 0.74;
  });
  footer(s, 7);
})();

// ───────────────────────── Slide 8 — People support ─────────────────────────
(() => {
  const s = slide();
  header(s, "PEOPLE SUPPORT", "Automation staff can always override");
  s.addText("Estate cases vary. The system handles the routine and the chasing — it never takes the keys away from staff.", { x: M, y: 1.95, w: W - 2 * M, h: 0.6, fontFace: F.body, fontSize: 16, italic: true, color: C.steel });
  rows(s, M, 2.95, [
    { t: "Editable message templates and follow-up timing" },
    { t: "Full pipeline view with manual status changes" },
    { t: "Manual overrides for appointment, payment, and hire   (in progress)", c: C.gold },
    { t: "Add phone, walk-in, and referral leads by hand   (in progress)", c: C.gold },
    { t: "Every change is written to an audit log" },
  ], { step: 0.66, w: 11.8, fs: 16 });
  footer(s, 8);
})();

// ───────────────────────── Slide 9 — Status board ─────────────────────────
(() => {
  const s = slide();
  header(s, "WHERE IT STANDS", "Done · In progress · Needs the firm");
  function column(x, w, title, col, items) {
    panel(s, x, 1.98, w, 4.55, C.panel);
    s.addShape(p.shapes.RECTANGLE, { x: x, y: 1.98, w: w, h: 0.5, fill: { color: col } });
    s.addText(title, { x: x + 0.2, y: 1.98, w: w - 0.4, h: 0.5, fontFace: F.mono, fontSize: 13, color: C.void, bold: true, valign: "middle", charSpacing: 2 });
    let yy = 2.7;
    items.forEach((it) => {
      s.addShape(p.shapes.RECTANGLE, { x: x + 0.25, y: yy + 0.07, w: 0.1, h: 0.1, fill: { color: col } });
      s.addText(it, { x: x + 0.48, y: yy - 0.04, w: w - 0.7, h: 0.6, fontFace: F.body, fontSize: 12, color: C.parch, valign: "top" });
      yy += 0.6;
    });
  }
  const w = 3.87, g = 0.21;
  column(M, w, "DONE", C.safe, [
    "Estate-specialized intake + qualification",
    "$300 Stripe payment gate",
    "Ghost Assistant nurture (instant + Day 1/2/4)",
    "Admin dashboard, templates & audit log",
    "TCPA opt-out / STOP handling",
    "Client tracker + PII security fix",
  ]);
  column(M + w + g, w, "IN PROGRESS", C.gold, [
    "Manual lead entry for staff",
    "Manual pipeline overrides",
  ]);
  column(M + 2 * (w + g), w, "NEEDS THE FIRM", C.warn, [
    "Clio Manage API connection",
    "Payments decision + keys",
    "Domain / DNS records",
    "SMS 10DLC registration",
  ]);
  footer(s, 9);
})();

// ───────────────────────── Slide 10 — Asks ─────────────────────────
(() => {
  const s = slide();
  header(s, "TO FINISH THE BUILD", "What we need from Crain & Wooley");
  // critical item highlighted
  panel(s, M, 2.0, W - 2 * M, 1.05, C.wall);
  s.addShape(p.shapes.RECTANGLE, { x: M, y: 2.0, w: 0.09, h: 1.05, fill: { color: C.gold } });
  s.addText([
    { text: "1.  Clio Manage developer app — Client ID + Secret", options: { bold: true, color: C.gold } },
    { text: "   (created by a Clio Manage admin)", options: { color: C.steel } },
    { text: "\nThe single biggest unblocker. A Grow login alone cannot create this — it lives in Clio Manage settings.", options: { color: C.parch } },
  ], { x: M + 0.32, y: 2.12, w: 11.7, h: 0.85, fontFace: F.body, fontSize: 14, valign: "middle" });
  rows(s, M + 0.02, 3.4, [
    { t: "Payments — confirm Stripe vs. Clio Payments; if Stripe, the account + $300 price ID" },
    { t: "Domain / DNS — who manages crainwooley.com (about 4 records to add)" },
    { t: "SMS — area-code preference + A2P 10DLC registration  (1–5 business days)" },
    { t: "Admin logins — which staff get access, and at what level" },
  ], { step: 0.74, w: 11.9, fs: 15 });
  s.addText("2.        3.        4.        5.", { x: -2, y: -2, w: 1, h: 1, fontSize: 1, color: C.void }); // spacer (no-op)
  footer(s, 10);
})();

// ───────────────────────── Slide 11 — Path to launch ─────────────────────────
(() => {
  const s = slide();
  header(s, "PATH TO LAUNCH", "From here to live");
  const phases = [
    ["1", "Credentials", "Firm provides Clio app, payment keys, DNS; start 10DLC."],
    ["2", "Integrate & Test", "Wire Clio, test in sandbox, finish manual staff tools."],
    ["3", "QA", "Full flow: intake → pay → schedule → hire → Clio matter."],
    ["4", "Train & Launch", "Staff walkthrough, then point the live domain."],
  ];
  const cw = 2.85, gap = 0.33;
  let x = M;
  phases.forEach(([num, t, d]) => {
    panel(s, x, 2.15, cw, 2.6, C.panel);
    s.addText(num, { x: x + 0.25, y: 2.3, w: 1, h: 0.9, fontFace: F.disp, fontSize: 44, color: C.gold, bold: true });
    s.addText(t, { x: x + 0.25, y: 3.25, w: cw - 0.5, h: 0.5, fontFace: F.mono, fontSize: 13, color: C.parch, bold: true, charSpacing: 1 });
    s.addText(d, { x: x + 0.25, y: 3.75, w: cw - 0.45, h: 0.9, fontFace: F.body, fontSize: 12.5, color: C.steel, valign: "top" });
    x += cw + gap;
  });
  panel(s, M, 5.15, W - 2 * M, 1.05, C.wall);
  s.addShape(p.shapes.RECTANGLE, { x: M, y: 5.15, w: 0.09, h: 1.05, fill: { color: C.warn } });
  s.addText([
    { text: "The timeline is driven by credential turnaround + 10DLC (1–5 business days) — ", options: { color: C.parch } },
    { text: "not by the remaining code.", options: { color: C.gold, bold: true } },
    { text: "  Once Clio + payment keys land, a working staging demo is days away.", options: { color: C.parch } },
  ], { x: M + 0.32, y: 5.15, w: 11.7, h: 1.05, fontFace: F.body, fontSize: 14.5, valign: "middle" });
  footer(s, 11);
})();

// ───────────────────────── Slide 12 — Close ─────────────────────────
(() => {
  const s = slide();
  s.addShape(p.shapes.RECTANGLE, { x: M, y: 2.2, w: 0.16, h: 0.16, fill: { color: C.gold } });
  s.addText("THE SHIFT", { x: M + 0.32, y: 2.13, w: 11, h: 0.34, fontFace: F.mono, fontSize: 12, color: C.gold, charSpacing: 4 });
  s.addText("From first contact to an open matter — automatically.", { x: M - 0.02, y: 2.6, w: 12.1, h: 1.6, fontFace: F.disp, fontSize: 44, color: C.parch, bold: true });
  s.addText([
    { text: "Can a lead go from website to scheduled consult without staff?", options: { color: C.parch } },
    { text: "   Yes.", options: { color: C.gold, bold: true, breakLine: true } },
    { text: "Does every lead get a response within 60 seconds?", options: { color: C.parch } },
    { text: "   Yes.", options: { color: C.gold, bold: true } },
  ], { x: M, y: 4.5, w: 12, h: 1.2, fontFace: F.body, fontSize: 18, lineSpacingMultiple: 1.3 });
  s.addText("FutureEng  —  Intake Systems & Revenue Automation", { x: M, y: 6.6, w: 12, h: 0.4, fontFace: F.mono, fontSize: 10, color: C.steel, charSpacing: 2 });
})();

p.writeFile({ fileName: "Crain-Wooley-Build-Status.pptx" }).then((f) => {
  console.log("WROTE", f);
}).catch((e) => { console.error("ERR", e); process.exit(1); });
