/**
 * Crain & Wooley Learning Center — full guide content for the nine pillars.
 *
 * Keyed by PillarSlug. The [pillar] route renders these. Copy is condensed from
 * the editorial source drafts (see /SEO Migration + /Learning Center markdown).
 *
 * GUARDRAILS:
 *  - readlist URLs point at the firm's EXISTING /blogs/... posts (never moved).
 *  - Educational only; every guide ends with a not-legal-advice disclaimer.
 *  - Reconcile against the firm's captured service-page copy once the crawl of
 *    estateplanningdfw.law completes (some practice pages were still pending).
 */

import type { GuideContent, PillarSlug } from './pillars'

const BASE = 'https://www.estateplanningdfw.law'

export const GUIDES: Record<PillarSlug, GuideContent> = {
  /* ───────────────────────── TRUSTS ───────────────────────── */
  trusts: {
    slug: 'trusts',
    eyebrow: 'Estate Planning Basics',
    title: 'Trusts in Texas, Explained',
    metaTitle: 'Trusts in Texas, Explained: Do You Need One? | Crain & Wooley',
    metaDescription:
      'A plain-language guide to trusts in Texas — what they are, revocable vs. irrevocable, how they avoid probate, and how to know if you need one. From DFW estate planning attorneys.',
    leadIn: 'Do you actually need a trust? Here is the honest answer.',
    lede: `A trust is a legal arrangement where you place assets — your home, accounts, a business interest — under instructions you write, managed by someone you choose (the trustee), for the people you choose (the beneficiaries). For many Texas families it is the cleanest way to pass things on without probate court, keep your affairs private, and stay in control if you ever cannot manage things yourself. For others, a well-drafted will is plenty.`,
    sections: [
      {
        h2: 'What a trust actually does',
        body: [
          `Think of a trust as a container with a rulebook. You move assets into the container while you are alive, and the rulebook says who manages them, who benefits, and what happens when you pass away or become unable to act. Because the container — not you personally — "owns" those assets, they do not have to go through the court process that otherwise transfers property after death.`,
        ],
        bullets: [
          { strong: 'Avoid probate.', text: 'Assets in a trust pass directly to your beneficiaries, outside the Tarrant or Dallas County probate courts.' },
          { strong: 'Stay in control if incapacitated.', text: 'Your successor trustee steps in immediately — no court-supervised guardianship.' },
          { strong: 'Keep things private.', text: 'A probated will is public record; a trust generally is not.' },
          { strong: 'Set the terms.', text: "Release an inheritance over time, or protect a beneficiary who isn't ready to manage money." },
        ],
      },
      {
        h2: 'Revocable vs. irrevocable — the first fork in the road',
        body: [
          `Almost every trust is one of two kinds, and the difference comes down to control. A revocable living trust is the workhorse — you can change or cancel it any time and usually act as your own trustee, so day to day nothing changes. Its job is avoiding probate and a smooth hand-off.`,
          `An irrevocable trust is the opposite bargain: you generally cannot undo it and you give up control, but the assets can move outside your taxable estate and beyond many creditors. A quick way to hold it: revocable = control and probate-avoidance; irrevocable = protection and tax planning.`,
        ],
      },
      {
        h2: 'Trust vs. will: which do you need?',
        body: [
          `A will says how assets pass after you die and names a guardian for minor children — but it generally goes through probate. A trust can move those same assets around probate and keeps working if you are incapacitated. Texas makes this less lopsided than many states because it allows independent administration — a streamlined probate that, for many estates, is far less burdensome than the horror stories suggest. That is why the honest answer is "it depends."`,
        ],
      },
      {
        h2: "How a trust avoids probate (and when it doesn't)",
        body: [
          `A trust only avoids probate for assets you actually fund into it — re-titling your home, accounts, and business interests into the trust's name. An unfunded trust is one of the most common and costly mistakes: a beautiful document that never had the assets moved in, so the family ends up in probate anyway.`,
        ],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Retirees & anyone wanting a smooth hand-off', text: '→ a revocable living trust is usually the conversation.' },
        { strong: 'Higher-net-worth or business-owning families', text: '→ irrevocable and tax-focused trusts come into play.' },
        { strong: 'Providing for a loved one with disabilities', text: '→ start with Special Needs & Disability.' },
        { strong: 'Blended families', text: '→ trusts can balance a current spouse and children from a prior relationship.' },
      ],
    },
    readlist: [
      { title: 'Understanding Texas Trusts: A Guide to Revocable Trusts', url: `${BASE}/blogs/2025/february/understanding-texas-trusts-a-guide-to-revocable-/` },
      { title: 'A Guide to the Different Types of Trusts', url: `${BASE}/blogs/2021/november/a-guide-to-different-types-of-trusts/` },
      { title: 'The Role of Trusts in Avoiding Probate', url: `${BASE}/blogs/2025/june/the-role-of-trusts-in-avoiding-probate/` },
      { title: 'Common Mistakes Made with Revocable Living Trusts', url: `${BASE}/blogs/2022/august/common-mistakes-made-with-revocable-living-trust/` },
      { title: 'Charitable Trusts: Leaving a Legacy That Matters', url: `${BASE}/blogs/2025/february/charitable-trusts-leaving-a-legacy-that-matters/` },
    ],
    quiz: {
      title: 'Do You Need a Trust?',
      body: 'Answer a few plain questions about your family and what you own, and we will tell you whether a trust is likely worth a conversation — or whether a will may be all you need.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/do-you-need-a-trust',
    },
    faq: [
      { q: "What's the difference between a will and a trust in Texas?", a: 'A will directs how your assets pass after death and usually goes through probate in your home county, such as Tarrant or Dallas. A trust creates a private arrangement that can help your heirs avoid probate court, transfer assets faster, and give you more control over how and when property is distributed.' },
      { q: 'Do I still need a will if I have a trust?', a: 'Yes — usually a short "pour-over" will that catches anything you did not move into the trust and names a guardian for minor children (a trust cannot). The two work together.' },
      { q: 'Does a revocable living trust protect assets or lower my taxes?', a: 'Generally no. Because you keep full control of a revocable trust, the assets are still treated as yours for tax and creditor purposes. Asset protection and estate-tax reduction are jobs for irrevocable trusts and other tools.' },
      { q: 'What if I set up a trust but never fund it?', a: 'It will not do its job. A trust only avoids probate for assets re-titled into it. Funding is essential, and it is the step most often missed.' },
    ],
    disclaimer: "Educational information only, not legal advice. Every family's situation is different — talk with a Texas estate planning attorney about your specifics.",
  },

  /* ───────────────────────── PROBATE ───────────────────────── */
  probate: {
    slug: 'probate',
    eyebrow: 'Estate Planning Basics',
    title: 'Probate in Texas, Explained',
    metaTitle: "Probate in Texas, Explained: When It's Required & How Long It Takes | Crain & Wooley",
    metaDescription:
      'A plain-language guide to probate in Texas — what it is, when it is required, how long it takes, what it costs, and how to avoid it. From DFW probate attorneys.',
    leadIn: 'If someone close to you has passed away — or you are planning ahead so your family can avoid the hassle — start here.',
    lede: `Probate is the court-supervised process of proving a will is valid, settling debts, and transferring what is left to the right people. It has a fearsome reputation, but Texas is one of the friendlier states for it. Here is when it is required, how long it takes, what it costs, and how to avoid it.`,
    sections: [
      {
        h2: 'What probate actually is',
        body: [
          `Probate is how legal title to someone's property officially passes after they die. A court confirms the will (or applies Texas's default rules if there isn't one), authorizes a person — the executor — to act, and oversees paying final debts and distributing the rest. In DFW that usually means the probate courts in Tarrant, Dallas, Collin, or Denton County, depending on where the person lived.`,
        ],
      },
      {
        h2: "When is probate required — and when isn't it?",
        body: [`Not every estate needs full probate. It depends on what the person owned and how it was titled.`],
        bullets: [
          { strong: 'Often skips probate:', text: 'assets with a named beneficiary (life insurance, retirement, "payable on death" accounts), property in a trust, and jointly owned property with survivorship.' },
          { strong: 'Usually needs probate:', text: "real estate or accounts titled in the deceased person's name alone with no beneficiary." },
        ],
      },
      {
        h2: "Texas's big advantage: independent administration",
        body: [
          `This is why probate horror stories are usually about other states. Texas allows independent administration, where the executor settles the estate with minimal court supervision once appointed — no judge signing off on every step. For most estates with a clear will, that makes Texas probate faster and cheaper than people expect.`,
        ],
      },
      {
        h2: 'How long does it take, and what does it cost?',
        body: [
          `A straightforward independent administration often runs a few months to about a year. Note the wrinkle — in Texas a will generally must be filed for probate within four years of the date of death. Cost scales with complexity — court fees plus attorney's fees, higher if the estate is contested. The single biggest cost driver isn't the court; it's conflict.`,
        ],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Just lost a loved one and named executor', text: '→ start here; the four-year clock matters.' },
        { strong: 'Planning ahead', text: '→ a trust or proper beneficiary titling can keep most assets out of probate entirely.' },
        { strong: 'Facing a will dispute', text: '→ that is probate litigation; talk to an attorney before responding.' },
        { strong: 'Out-of-state executor', text: '→ manageable with local counsel.' },
      ],
    },
    readlist: [
      { title: 'What Is Probate, and When Is It Required?', url: `${BASE}/blogs/2025/october/what-is-probate-and-when-is-it-required-everythi/` },
      { title: 'Does Texas Require a Lawyer to Probate a Will?', url: `${BASE}/blogs/2024/september/does-texas-require-a-lawyer-to-probate-a-will-/` },
      { title: 'What Are the Costs Associated with Probate in Texas?', url: `${BASE}/blogs/2024/july/what-are-the-costs-associated-with-probate-in-te/` },
      { title: 'Can Probate Be Avoided?', url: `${BASE}/blogs/2024/may/can-probate-be-avoided-/` },
      { title: "Probate vs. Non-Probate Assets: What's the Difference?", url: `${BASE}/blogs/2024/september/probate-vs-non-probate-assets-what-s-the-differe/` },
    ],
    quiz: {
      title: 'Do You Need Probate?',
      body: 'Answer a few questions about the estate and how things were titled, and we will tell you whether full probate is likely required — or whether a simpler Texas alternative fits.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/do-you-need-probate',
    },
    faq: [
      { q: 'How long do I have to probate a will in Texas?', a: 'Generally four years from the date of death. After that, admitting the will becomes much harder and some options disappear — so it is best not to wait.' },
      { q: 'Do I need a lawyer to probate a will in Texas?', a: 'In most Texas counties, an executor representing an estate is required to have an attorney, because the executor acts on behalf of others (the beneficiaries), not just themselves. Practically, almost everyone uses one.' },
      { q: 'Can probate be avoided?', a: 'Often, yes — through a funded trust, beneficiary designations, and survivorship titling. Planning ahead is what keeps assets out of probate.' },
      { q: 'Are probate records public?', a: 'Yes. Once a will is probated it becomes a public court record — one reason some families prefer the privacy of a trust.' },
    ],
    disclaimer: 'Educational information only, not legal advice. Texas probate rules have important exceptions — talk with a Texas probate attorney about your specific situation.',
  },

  /* ───────────────────────── WILLS ───────────────────────── */
  wills: {
    slug: 'wills',
    eyebrow: 'Estate Planning Basics',
    title: 'Wills in Texas, Explained',
    metaTitle: 'Wills in Texas, Explained: What Yours Should Cover | Crain & Wooley',
    metaDescription:
      'A plain-language guide to wills in Texas — what a will can and cannot do, the types that are valid, guardianship for your kids, and why online wills are risky. From DFW estate planning attorneys.',
    leadIn: 'A will is where almost everyone should start — especially if you have young children.',
    lede: `It says who gets what, who is in charge of carrying out your wishes, and, most importantly, who raises your kids if you cannot. Here is what a will really does (and doesn't), which kinds are valid in Texas, and why the cheap online route can backfire.`,
    sections: [
      {
        h2: "What a will does — and what it can't",
        body: [`A valid will lets you name who inherits, name an executor, name a guardian for minor children, and state your wishes clearly. What it doesn't do trips people up:`],
        bullets: [
          { strong: "It doesn't avoid probate", text: '— it is your instructions to the probate court. If avoiding probate is the goal, that is a trust.' },
          { strong: "It doesn't override beneficiary designations", text: '— life insurance and retirement accounts pass to whoever is named on them.' },
          { strong: "It doesn't take effect while you're alive", text: '— for incapacity you need powers of attorney.' },
        ],
      },
      {
        h2: 'The one thing only a will can do: name a guardian for your kids',
        body: [`If you have minor children, this is the single biggest reason to have a will. Without one, a Texas court decides who raises your children — and its pick may not be yours. For young families, that one paragraph is worth the whole document.`],
      },
      {
        h2: 'Types of wills in Texas (and which hold up)',
        bullets: [
          { strong: 'Attested (formal) will', text: '— typed, signed, witnessed per Texas requirements. The reliable standard.' },
          { strong: 'Holographic will', text: '— entirely handwritten and signed. Valid in Texas but easy to get wrong and easy to challenge.' },
          { strong: 'Online / DIY wills', text: '— may not meet Texas formalities; they feel like a bargain until they fail when needed.' },
          { strong: 'Pour-over will', text: '— a short will used alongside a trust to catch anything left out of it.' },
        ],
      },
      {
        h2: 'What happens if you die without a will',
        body: [`Texas's intestacy rules take over — a fixed formula divides your property in a set order. A surviving spouse may not automatically inherit everything, especially in blended families. The state's default is rarely what you would have chosen.`],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Parents of young children', text: '→ a will + guardian designation is your first move.' },
        { strong: 'Own a home or meaningful assets', text: '→ a will is the floor; ask whether a trust fits too.' },
        { strong: 'Blended family', text: '→ the intestacy default can go badly; a will keeps it intentional.' },
      ],
    },
    readlist: [
      { title: 'Types of Wills in Texas: Which Is Best for You?', url: `${BASE}/blogs/2023/july/types-of-wills-in-texas-which-is-best-for-you-/` },
      { title: "Aren't Online Wills as Good as an Attorney's?", url: `${BASE}/blogs/2019/july/aren-t-online-wills-as-good-as-anything-you-atto/` },
      { title: 'What Is a Pour-Over Will, and Do I Need One?', url: `${BASE}/blogs/2018/july/what-is-a-pour-over-will-and-do-i-need-one-/` },
      { title: 'What Is a Holographic Will?', url: `${BASE}/blogs/2020/october/what-is-a-holographic-will-/` },
    ],
    quiz: {
      title: 'Which Estate Plan Do I Need?',
      body: 'Answer a few questions about your family and what you own, and we will point you to the right starting documents.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/which-plan-do-i-need',
    },
    faq: [
      { q: 'Is a handwritten will valid in Texas?', a: 'Yes — a holographic will written entirely in your own hand and signed can be valid. But it is easy to make mistakes that invite a challenge.' },
      { q: 'Do I still need a will if I have a trust?', a: 'Yes — a short pour-over will catches anything outside the trust and names a guardian for minor children (a trust cannot).' },
      { q: 'Will a will keep my family out of probate?', a: 'No. A will is processed through probate. To avoid probate you generally need a funded trust and proper beneficiary titling.' },
    ],
    disclaimer: 'Educational information only, not legal advice. Talk with a Texas estate planning attorney about your specific situation.',
  },

  /* ──────────────────── POWERS OF ATTORNEY ──────────────────── */
  'powers-of-attorney': {
    slug: 'powers-of-attorney',
    eyebrow: 'Estate Planning Basics',
    title: 'Powers of Attorney & Incapacity, Explained',
    metaTitle: "Powers of Attorney in Texas: Who Decides If You Can't | Crain & Wooley",
    metaDescription:
      'A plain-language guide to powers of attorney and incapacity planning in Texas — financial POA, medical POA, living wills, and how they keep your family out of guardianship court. From DFW attorneys.',
    leadIn: 'Most estate planning is about death. This part is about life — the stretch where you are still here but cannot make decisions for yourself.',
    lede: `Without the right documents, your family cannot pay your bills or direct your care without going to court. With them, the people you trust simply step in. These are among the most-used documents in any plan, and the easiest to overlook.`,
    sections: [
      {
        h2: 'The two decisions you are planning for',
        bullets: [
          { strong: 'Who handles my money and property?', text: '→ a financial (durable) power of attorney.' },
          { strong: 'Who makes my medical decisions?', text: '→ a medical power of attorney.' },
        ],
        body: [`The word durable matters: it means the document stays in effect even after you become incapacitated — which is the entire point.`],
      },
      {
        h2: 'Financial and medical powers of attorney',
        body: [
          `A financial POA lets someone you choose — your agent — manage your financial life if you cannot: pay bills, handle banking and property, manage investments. Done right, no one has to ask a judge for permission to keep your household running.`,
          `A medical POA names the person who speaks for you on healthcare decisions if you cannot communicate. It prevents the painful situation where family members disagree at the worst moment and no one has clear authority.`,
        ],
      },
      {
        h2: 'Living wills and advance directives',
        body: [`A living will (in Texas, a directive to physicians) states your own wishes about life-sustaining treatment if you are terminally or irreversibly ill — different from the medical POA, which names a decision-maker. A DNR and HIPAA authorizations round out the set.`],
      },
      {
        h2: 'Why these keep you out of guardianship court',
        body: [`If you lose capacity without these documents, someone must petition a Texas court to be appointed your guardian — public, ongoing, expensive, and the court may not pick who you would. A complete set of powers of attorney is the private, inexpensive alternative you set up in advance. Texas also updated its POA laws recently, so documents that are several years old are worth a review.`],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Every adult', text: '→ financial + medical POA and a directive are the baseline. Even healthy 25-year-olds.' },
        { strong: 'Caring for aging parents', text: '→ make sure theirs are current before a crisis, not during one.' },
        { strong: 'Recently moved to Texas', text: '→ out-of-state documents may need redoing to Texas standards.' },
      ],
    },
    readlist: [
      { title: 'The Role of Power of Attorney Documents', url: `${BASE}/blogs/2020/may/the-role-of-power-of-attorney-documents/` },
      { title: 'Duties of a Financial Power of Attorney', url: `${BASE}/blogs/2021/may/duties-and-responsibilities-of-a-financial-power/` },
      { title: 'Duties of a Medical Power of Attorney', url: `${BASE}/blogs/2021/july/duties-and-responsibilities-of-a-medical-power-o/` },
      { title: 'DNR vs. Directive to Physicians', url: `${BASE}/blogs/2020/july/dnr-vs-directive-to-physicians/` },
    ],
    quiz: {
      title: 'Which Estate Plan Do I Need?',
      body: 'A few quick questions to see which documents you are missing — incapacity planning included.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/which-plan-do-i-need',
    },
    faq: [
      { q: "What's the difference between a medical power of attorney and a living will?", a: 'A medical POA names a person to make healthcare decisions for you. A living will states your own wishes about life-sustaining treatment. Most plans include both.' },
      { q: 'Does a power of attorney still work after I become incapacitated?', a: 'Only if it is durable. A durable power of attorney is designed to remain effective after incapacity — when you need it most.' },
      { q: "What if I don't have these and become incapacitated?", a: 'Your family likely has to go to court for guardianship — public, costly, slow — and the court chooses who acts for you.' },
    ],
    disclaimer: 'Educational information only, not legal advice. Talk with a Texas estate planning attorney about your specific situation.',
  },

  /* ───────────────── MEDICAID & LONG-TERM CARE ───────────────── */
  'medicaid-long-term-care': {
    slug: 'medicaid-long-term-care',
    eyebrow: 'Elder Law',
    title: 'Medicaid & Long-Term Care, Explained',
    metaTitle: 'Medicaid & Long-Term Care Planning in Texas | Crain & Wooley',
    metaDescription:
      'A plain-language guide to paying for long-term care in Texas — how Medicaid differs from Medicare, crisis vs. proactive planning, and protecting savings from nursing-home costs. From DFW elder law attorneys.',
    leadIn: 'Nursing-home and in-home care can cost thousands a month — and most people are surprised by who actually pays.',
    lede: `(Hint: usually not Medicare.) For many Texas families the real threat to a lifetime of savings isn't taxes — it's a few years of long-term care. Here is how care gets paid for and how to plan ahead.`,
    sections: [
      {
        h2: 'The costly misunderstanding: Medicare is not long-term care',
        body: [`Medicare covers only limited, short-term skilled care after a hospital stay — not the months or years of custodial care most people eventually need. Medicaid is the largest payer of long-term care in the country — but it is needs-based, so qualifying without going broke takes planning.`],
      },
      {
        h2: 'Two kinds of planning: proactive vs. crisis',
        bullets: [
          { strong: 'Proactive long-term-care planning', text: 'happens years ahead, while you are healthy — positioning assets (sometimes via certain irrevocable trusts) so more is protected if care is ever needed.' },
          { strong: 'Medicaid crisis planning', text: 'happens when care is needed now. Legitimate strategies still exist, but the toolbox is smaller. It is damage control.' },
        ],
        body: [`The earlier you plan, the more you keep.`],
      },
      {
        h2: 'How eligibility works (the short version)',
        body: [`Medicaid long-term-care benefits have income and asset limits, and the program looks back at transfers before you apply — so giving everything away right before applying backfires and can trigger a penalty period. Texas also runs an estate recovery program (MERP) that can seek reimbursement from the estate after death — another reason to plan early.`],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Approaching or in retirement', text: '→ proactive planning now gives the most protection.' },
        { strong: 'A parent just entered (or is about to enter) care', text: '→ that is crisis planning; act quickly, options remain.' },
        { strong: 'Caring for a spouse', text: '→ there are specific protections for the healthy spouse worth understanding.' },
      ],
    },
    readlist: [
      { title: 'Medicaid Planning for Seniors: What You Need to Know', url: `${BASE}/blogs/2026/february/medicaid-planning-for-seniors-what-you-need-to-k/` },
      { title: 'Plan for Long-Term Care Without Draining Your Savings', url: `${BASE}/blogs/2026/march/how-to-plan-for-long-term-care-without-draining-/` },
      { title: 'Medicaid Crisis Planning vs. Long-Term Care Planning', url: `${BASE}/blogs/2026/april/medicaid-crisis-planning-vs-long-term-care-plann/` },
      { title: 'Does Medicaid Cover Nursing Home Expenses?', url: `${BASE}/blogs/2021/august/does-medicaid-cover-nursing-home-expenses-/` },
    ],
    quiz: {
      title: 'Which Estate Plan Do I Need?',
      body: 'A few questions to see whether long-term-care planning belongs in your plan now.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/which-plan-do-i-need',
    },
    faq: [
      { q: 'Does Medicare pay for nursing-home care?', a: 'Only briefly. Medicare covers limited short-term skilled care after a hospital stay — not long-term custodial care. Medicaid is the main payer for that, if you qualify.' },
      { q: 'Can I just give my assets to my kids to qualify for Medicaid?', a: 'No — Medicaid looks back at transfers before you apply, and gifting can trigger a penalty period. Legitimate strategies exist, but they must be structured correctly and in time.' },
      { q: 'Is it too late to plan if my parent already needs care?', a: 'No. That is crisis planning — fewer options than planning ahead, but legitimate strategies still exist. Act quickly.' },
    ],
    disclaimer: 'Educational information only, not legal advice. Medicaid rules are complex and change often — talk with a Texas elder law attorney about your specific situation.',
  },

  /* ─────────────────── SPECIAL NEEDS & DISABILITY ─────────────────── */
  'special-needs': {
    slug: 'special-needs',
    eyebrow: 'Planning for a Loved One',
    title: 'Special Needs & Disability Planning, Explained',
    metaTitle: 'Special Needs Planning in Texas: Protect Benefits & Your Loved One | Crain & Wooley',
    metaDescription:
      'A plain-language guide to special needs and disability planning in Texas — special needs trusts, guardianship and alternatives, and how to provide for a loved one without risking their benefits.',
    leadIn: 'If you care for a child or adult with a disability, ordinary estate planning can accidentally do harm.',
    lede: `Leaving money the usual way can disqualify your loved one from needs-based benefits like Medicaid and SSI. The good news: with the right tools you can provide for them and protect those benefits.`,
    sections: [
      {
        h2: 'The trap: why a normal inheritance can backfire',
        body: [`Needs-based benefits have strict income and asset limits. If your loved one suddenly receives money in their own name, they can be pushed over those limits and lose coverage until the funds are spent down. The well-meaning act of "leaving them something" can cost more than it gives.`],
      },
      {
        h2: 'The core tool: a special (supplemental) needs trust',
        body: [`A special needs trust holds assets for your loved one without those assets counting against eligibility. A trustee pays for things that improve quality of life — therapies, equipment, education, travel — while core benefits stay intact. A related ABLE account can complement a trust for smaller amounts.`],
      },
      {
        h2: 'Guardianship, conservatorship, and the alternatives',
        body: [`When an adult cannot make all their own decisions, families often think of guardianship or conservatorship — court processes. Texas law requires considering less-restrictive alternatives first, like supported decision-making and powers of attorney. Sometimes full guardianship is necessary; often a lighter tool serves better.`],
      },
      {
        h2: 'Plan early, and coordinate everyone',
        body: [`Start before age 18 if you can — the legal picture changes the day a child becomes an adult. And make sure grandparents and relatives direct gifts into the trust, not to the individual, or they can trigger the very problem you planned around.`],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Parents of a child with a disability', text: '→ a special needs trust + a plan for adulthood is the core.' },
        { strong: 'Adult child receiving benefits', text: '→ route any inheritance through a trust, not to them directly.' },
        { strong: 'Facing a decision-making question for an adult', text: '→ explore alternatives to guardianship first.' },
      ],
    },
    readlist: [
      { title: 'Why Is Disability Planning Essential?', url: `${BASE}/blogs/2024/may/why-is-disability-planning-essential-/` },
      { title: 'Preventing the Need for Guardianship: Planning Ahead', url: `${BASE}/blogs/2023/november/preventing-the-need-for-guardianship-planning-ah/` },
      { title: '"Only Old People Need Disability Planning, Right?"', url: `${BASE}/blogs/2020/may/only-old-people-need-disability-planning-right-/` },
    ],
    quiz: {
      title: 'Which Estate Plan Do I Need?',
      body: 'A few questions to see whether a special needs trust and related tools belong in your plan.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/which-plan-do-i-need',
    },
    faq: [
      { q: 'Will leaving money to my disabled child affect their benefits?', a: 'It can. An outright gift or inheritance in their own name may push them over needs-based limits and suspend benefits. A special needs trust avoids that.' },
      { q: 'What does a special needs trust pay for?', a: "Quality-of-life expenses benefits don't cover — therapies, equipment, education, recreation — while preserving eligibility for core benefits." },
      { q: 'Do I have to get guardianship of my adult child?', a: 'Not always. Texas requires considering less-restrictive alternatives first. Sometimes guardianship is necessary; often it is not.' },
    ],
    disclaimer: 'Educational information only, not legal advice. Talk with a Texas special needs / elder law attorney about your specific situation.',
  },

  /* ───────────────────── BUSINESS SUCCESSION ───────────────────── */
  'business-succession': {
    slug: 'business-succession',
    eyebrow: 'For Business Owners',
    title: 'Business Succession Planning, Explained',
    metaTitle: 'Business Succession Planning in Texas: Keep It Running | Crain & Wooley',
    metaDescription:
      'A plain-language guide to business succession and continuity planning in Texas — what happens to your company if you step away, get sick, or pass, and how to plan for a smooth transition.',
    leadIn: 'Your business may be your largest asset and your family’s livelihood — but what happens to it if you step away, get sick, or pass unexpectedly?',
    lede: `Without a plan, a thriving company can stall overnight. Succession planning makes sure what you built keeps running and ends up in the right hands.`,
    sections: [
      {
        h2: 'The two scenarios you are planning for',
        bullets: [
          { strong: 'The expected exit', text: '— you retire or sell, and want a smooth, tax-smart handoff.' },
          { strong: 'The sudden one', text: '— death, disability, or incapacity with no warning. This is the gap that sinks businesses, because no one has authority to act.' },
        ],
      },
      {
        h2: 'Continuity: who runs it on Monday morning?',
        body: [`The first job is continuity — making sure the business can operate the day after something happens to you: clear authority (a business power of attorney or documented management succession), access to accounts, and instructions your team and family can follow.`],
      },
      {
        h2: 'Buy-sell agreements and co-owners',
        body: [`If you have partners, a buy-sell agreement is the cornerstone: it sets in advance what happens to an owner's share on death, disability, divorce, or departure — who can buy, at what price, and how it is funded (often with insurance). It prevents being in business with a former partner's heirs.`],
      },
      {
        h2: 'Weaving the business into your estate plan',
        body: [`Your company has to connect to your personal plan — holding it in a trust, planning for estate-tax exposure, equalizing inheritances when one child works in the business and others don't, and protecting it from disputes. One coordinated plan, not two that contradict each other.`],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Own a business or practice', text: '→ continuity + a succession plan are essential.' },
        { strong: 'Have co-owners', text: '→ a funded buy-sell agreement should be in place.' },
        { strong: 'Even a side hustle', text: '→ it still needs a plan for who handles it if you cannot.' },
      ],
    },
    readlist: [
      { title: 'Small Business Owner to Small Business Owner: Planning', url: `${BASE}/blogs/2021/september/small-business-owner-to-small-business-owner-pla/` },
      { title: 'Got a Side Hustle? Protect Your Business', url: `${BASE}/blogs/2026/may/got-a-side-hustle-or-freelance-gig-protect-your-/` },
      { title: 'Business Continuity Planning — Part I', url: `${BASE}/blogs/2020/april/business-continuity-planning-part-i-/` },
    ],
    quiz: {
      title: 'Which Estate Plan Do I Need?',
      body: 'A few questions to see how your business should fit into your overall plan.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/which-plan-do-i-need',
    },
    faq: [
      { q: 'What happens to my business if I die without a plan?', a: 'Often it stalls — accounts can freeze and no one may have authority to operate or sign. A continuity plan keeps it running while ownership transfers.' },
      { q: 'What is a buy-sell agreement?', a: "A contract among co-owners setting what happens to an owner's share on death, disability, divorce, or departure — who can buy, at what price, and how it is funded." },
      { q: "Do I need this if I'm a solo owner or freelancer?", a: 'Yes. Even a one-person business needs someone with authority to step in or wind it down if you cannot.' },
    ],
    disclaimer: 'Educational information only, not legal advice. Talk with a Texas estate planning / business attorney about your specific situation.',
  },

  /* ─────────────────── FAMILY & LIFE SITUATIONS ─────────────────── */
  'family-situations': {
    slug: 'family-situations',
    eyebrow: 'Estate Planning for Real Life',
    title: 'Family & Life Situations, Explained',
    metaTitle: 'Estate Planning for Your Family Situation in Texas | Crain & Wooley',
    metaDescription:
      'A plain-language guide to estate planning for real-life family situations in Texas — blended families, marriage and community property, beneficiaries, digital assets, and keeping your plan current.',
    leadIn: 'The documents are only half of estate planning. The other half is your actual life — who is in your family, what you own, and how that keeps changing.',
    lede: `A plan that fit ten years ago can quietly become a liability after a marriage, divorce, new child, move, or death. Here are the family situations where planning gets nuanced in Texas.`,
    sections: [
      {
        h2: 'Blended families: the situation that needs planning most',
        body: [`If you have children from a prior relationship, a current spouse, or both, default rules can produce outcomes nobody wanted — conflict between a spouse and stepchildren, or kids unintentionally disinherited. Thoughtful planning, often using trusts, lets you provide for your spouse and protect your children on your terms.`],
      },
      {
        h2: 'Marriage, community property, and divorce',
        body: [`Texas is a community-property state, which shapes what is "yours" versus "the marriage's" — and surprises people who moved from elsewhere. Marriage, divorce, and remarriage are all planning triggers; a divorce affects parts of your plan automatically but not all, and an old plan may still name an ex.`],
      },
      {
        h2: 'Beneficiary designations: the plan behind your plan',
        body: [`Life insurance, retirement, and "payable on death" accounts pass by beneficiary designation, outside your will. Outdated forms — an ex still listed, no contingent beneficiary — override everything else. Reviewing them is one of the highest-value, lowest-effort moves in estate planning.`],
      },
      {
        h2: 'Digital assets, and keeping your plan current',
        body: [`Your online life is part of your estate: financial logins, email, photos, crypto, social accounts. Without access and authority, your family may be locked out. And the most common failure isn't not having a plan — it's having an outdated one. Review after any major life change and periodically as Texas law evolves.`],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Blended family', text: '→ the highest-priority situation; plan intentionally.' },
        { strong: 'Recently married, divorced, or moved to Texas', text: '→ your plan and beneficiaries likely need updating now.' },
        { strong: 'Everyone', text: '→ check your beneficiary designations and add a digital-asset plan.' },
      ],
    },
    readlist: [
      { title: 'Estate Planning for Blended Families: Getting It Right', url: `${BASE}/blogs/2026/january/estate-planning-for-blended-families-tips-for-ge/` },
      { title: 'Understanding Beneficiary Designations', url: `${BASE}/blogs/2025/december/understanding-beneficiary-designations-and-why-t/` },
      { title: 'Why Failing to Plan for Digital Assets Could Hurt Your Family', url: `${BASE}/blogs/2026/april/why-failing-to-plan-for-digital-assets-could-lea/` },
    ],
    quiz: {
      title: 'Which Estate Plan Do I Need?',
      body: 'A few questions about your family and what you own, and we will point you to the right next step.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/which-plan-do-i-need',
    },
    faq: [
      { q: 'Why do blended families need special planning?', a: 'Because default rules can pit a surviving spouse against stepchildren or unintentionally disinherit your kids. Planning (often with trusts) lets you provide for everyone on your terms.' },
      { q: 'Does getting divorced update my estate plan automatically?', a: 'Partly. Texas law changes some things on divorce, but not everything — and beneficiary designations may still name your ex. Update promptly.' },
      { q: 'Should my estate plan cover digital assets?', a: 'Yes. Logins, email, photos, and crypto are part of your estate; a plan names who can access them and gives legal authority to do so.' },
    ],
    disclaimer: 'Educational information only, not legal advice. Talk with a Texas estate planning attorney about your specific situation.',
  },

  /* ───────────────────── TAX & LEGACY PLANNING ───────────────────── */
  'tax-estate-planning': {
    slug: 'tax-estate-planning',
    eyebrow: 'For Larger Estates',
    title: 'Tax & Legacy Planning, Explained',
    metaTitle: 'Estate Tax & Legacy Planning in Texas: Keep More in the Family | Crain & Wooley',
    metaDescription:
      'A plain-language guide to tax and legacy planning in Texas — estate and gift tax, the step-up in basis, the 2026 exemption sunset, charitable giving, and protecting larger estates.',
    leadIn: 'Texas has no state estate or inheritance tax — which is great, but it is not the whole story.',
    lede: `Larger estates can still face the federal estate and gift tax, and how you structure things affects how much your family keeps. Here are the main levers worth knowing.`,
    sections: [
      {
        h2: 'The good news, and the limit of it',
        body: [`There is no Texas estate tax and no Texas inheritance tax. The federal estate tax only applies to estates above a large exemption, so most families never owe it. But if your estate is sizable — a business, appreciated real estate, significant investments — you may be in the range where federal planning matters.`],
      },
      {
        h2: 'The 2026 exemption sunset — why timing matters now',
        body: [`The federal estate-and-gift-tax exemption is currently historically high but is scheduled to drop substantially when current law sunsets. For larger estates, certain strategies that lock in today's higher exemption generally can't be done retroactively — so review before the rules change, not after.`],
      },
      {
        h2: 'The step-up in basis — quiet but powerful',
        body: [`When someone passes away, many assets get a step-up in basis to their date-of-death value, which can wipe out built-in capital-gains tax for heirs. It also means giving an appreciated asset away during life can forfeit a step-up your heirs would have gotten. Coordinating gifts, basis, and the estate plan is where real money is saved or lost.`],
      },
      {
        h2: 'Gifting, trusts, and charitable strategies',
        bullets: [
          { strong: 'Lifetime gifting', text: 'moves value (and future growth) out of your taxable estate.' },
          { strong: 'Irrevocable trusts', text: 'can remove assets from your estate while still providing for family.' },
          { strong: 'Charitable trusts and giving', text: 'reduce tax while supporting causes you care about.' },
          { strong: 'Asset protection', text: 'shields wealth from creditors alongside the tax planning.' },
        ],
      },
    ],
    callout: {
      title: 'Does this apply to me?',
      items: [
        { strong: 'Sizable estate, business, or appreciated property', text: '→ review before the exemption sunset.' },
        { strong: 'Charitably inclined', text: '→ there are tax-smart ways to give that also benefit your family.' },
        { strong: 'Most families', text: '→ you likely will not owe federal estate tax, but the step-up rule still matters for your heirs.' },
      ],
    },
    readlist: [
      { title: 'Navigating the 2026 Estate and Gift Tax Sunset', url: `${BASE}/blogs/2024/november/navigating-the-2026-estate-and-gift-tax-sunset/` },
      { title: 'What Is the Step-Up in Basis, and Why Should I Care?', url: `${BASE}/blogs/2021/august/what-is-the-step-up-basis-and-why-should-i-care-/` },
      { title: 'How to Minimize Taxes Through Strategic Estate Planning', url: `${BASE}/blogs/2025/november/how-to-minimize-taxes-through-strategic-estate-p/` },
    ],
    quiz: {
      title: 'Which Estate Plan Do I Need?',
      body: 'A few questions to see whether tax and legacy strategies belong in your plan.',
      cta: 'Take the quiz',
      href: '/learn/quizzes/which-plan-do-i-need',
    },
    faq: [
      { q: 'Does Texas have an estate or inheritance tax?', a: 'No — Texas has neither. Larger estates may still face the federal estate tax, which only applies above a high exemption.' },
      { q: 'What is the 2026 exemption sunset?', a: 'The federal estate-and-gift-tax exemption is scheduled to drop when current law sunsets. Families with larger estates may want to act before that happens.' },
      { q: 'What is the step-up in basis?', a: 'Many assets reset to date-of-death value when inherited, which can eliminate capital-gains tax on prior appreciation — which is why gifting appreciated assets during life can sometimes cost more than it saves.' },
    ],
    disclaimer: 'Educational information only, not legal or tax advice. Tax laws change — talk with a Texas estate planning attorney and your tax advisor about your specific situation.',
  },
}
