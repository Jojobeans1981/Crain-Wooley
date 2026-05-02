# For Q — What We Need From Justin to Go Live

Hey Q,

System is built on our end. We're blocked on a few things from Justin
before we can finish the deploy. Here's exactly what we need him to
do and send over.

---

## 1. Stripe (Highest Priority)

Has to be his account — money goes to the firm's bank, not ours.

Justin needs to:
- Create an account at stripe.com with his firm email
- Complete business verification (EIN + bank account for payouts)
- Create a product: "Initial Consultation" — $300 one-time

We need him to send us:
- Secret Key (Developers → API Keys)
- Publishable Key (same page)
- Price ID for the $300 product (starts with `price_...`)

Tell him 1Password or Signal only — not email or text.

---

## 2. Clio API Access

He already has Clio. Just needs to create a developer app so we can
connect to it.

Justin needs to:
1. Log into app.clio.com
2. Go to Settings → Developer Applications → Create Application
3. Fill in:
   - Name: FutureEng Intake Engine
   - Redirect URI: `https://intake.crainwooley.com/api/clio/callback`
   - Scopes: contacts:read, contacts:write, matters:read, matters:write,
     calendar:read, tasks:write
4. Save and send us the Client ID + Client Secret

Also need him to answer:
- What's his calendar event type called in Clio Grow? (the one clients
  book for consultations)
- What are his practice area names exactly as they appear in Clio?
  (Personal Injury, Family Law, etc. — we need the exact spelling)
- What's his standard new matter task checklist? (tasks that should
  auto-create in Clio the moment someone gets marked as a hired client)

---

## 3. DNS

Need 4 records added to wherever crainwooley.com is registered.
Ask him who manages his domain. If he has a web person we send them
the records directly. If he handles it himself we walk him through it —
takes about 5 minutes.

---

## 4. Phone Area Code

We're buying a dedicated number for the SMS sequences. Ask him what
area code he wants — local to the firm or doesn't matter.

---

## Short Version — What We're Waiting On

1. Stripe account + 3 keys
2. Clio developer app credentials (Client ID + Secret)
3. Clio answers: event type name, practice area names, task checklist
4. Domain contact for DNS records
5. Area code preference

Once we have Stripe and Clio we can run the full end-to-end test.
DNS just needs to happen before we point the live domain at the app.

Can you get Justin on a call this week to knock out the Clio part?
Easier to do that one live than back and forth over messages.

— Joe
