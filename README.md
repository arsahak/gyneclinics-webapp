# GyneX — Patient & Doctor Web (UI)

Web version of the GyneX patient and doctor apps. Sign-in and accounts use the Gyneclinics backend
through Auth.js; the cycle log, chats and consultations are still mock data kept in the browser (localStorage).

```bash
cp .env.local.example .env.local   # or create it: AUTH_SECRET + NEXT_PUBLIC_API_URL
npm run dev                        # http://localhost:3000 (backend on :8000)
```

## Sign-in and sessions

`auth.ts` (Auth.js v5) owns the session: a JWT in an encrypted, httpOnly cookie. The backend token is kept
inside it and only read on the server, never sent to the browser.

1. `/login` — phone number, then the SMS code (in development the backend's `OTP_BYPASS_CODE` works).
2. New number → `/register` — choose patient or doctor and enter your name; the backend creates the account.
3. `/onboarding/patient` or `/onboarding/doctor` → `/consent` → the app. Doctors wait on `/doctor/pending`
   until an admin approves them.

`proxy.ts` sends signed-out users to `/login` and keeps each role in its own area. The layouts then check
onboarding, consent and verification against fresh backend data (`lib/session.ts`) before rendering.
Server actions in `app/actions/` call the backend and update the session.

## Structure

| Path | What's there |
| --- | --- |
| `auth.ts`, `proxy.ts` | Auth.js session and route protection |
| `app/(auth)/` | Login + OTP, account type, patient/doctor onboarding, consent |
| `app/patient/` | Home tracker, calendar, learn, insights, doctors, messages, profile |
| `app/doctor/` | Dashboard, verification pending, messages, reviews, profile |
| `app/admin/stories` | Demo moderation queue for approving or declining submitted community stories |
| `component/` | UI primitives (`ui/`) and feature components |
| `lib/services/` | **Swap point for the backend** — mock-backed async functions today |
| `lib/store/` | Client state (zustand + localStorage) standing in for the API |
| `lib/cycle.ts` | Cycle length, prediction, fertile window maths |
| `lib/chat-guard.ts` | Blocks phone numbers, emails, links and social handles in chat/reviews |
| `lib/locale/` | Location detection and region-based consultation pricing |
| `lib/ads.ts` | Ad slot placement rules |

## Community story moderation

Patients can submit a story from **Learn → Share story**. Each submission stays pending until it is
reviewed in the demo admin dashboard at `/admin/stories`. Only approved stories appear in the Learn
feed. This workflow is stored locally in the current browser profile; production deployment needs
server-side moderation, authentication, and persistence.

## Region-based pricing

When the app opens it detects the visitor's country (IP lookup, falling back to device time zone),
maps it to a region and logs the open. Doctors set one base fee in GBP (the Europe & UK price);
each region applies a multiplier from `lib/locale/regions.ts`:

| Region | Currency | Multiplier |
| --- | --- | --- |
| Europe & UK | GBP | 1.00 |
| North America | USD | 1.00 |
| Middle East | USD | 0.80 |
| East Asia & Pacific | USD | 0.60 |
| Latin America | USD | 0.45 |
| Africa | USD | 0.35 |
| South Asia | USD | 0.25 |

Client-side detection can be bypassed with a VPN, so the backend must decide the final price
(server-side IP country and billing country) before taking payment.

## Consultations & messaging

One rule: **chatting with a doctor is a consultation.** Policy values live in `lib/consultation.ts`.

1. Patient opens a doctor → **Book consultation** → picks *Chat now* (doctor online) or a time slot.
2. Writes their concern (sent as the first message) → pays → booking is **confirmed automatically**.
3. Chat is open for **24 hours** from the start time, then **7 days of free follow-up** on the same concern.
4. After that the chat is read-only; **Book again** starts a new consultation.
5. Full refund if the doctor doesn't reply within **12 hours**.

Checkout (`component/booking/checkout.tsx`) takes real payments through **Stripe**: **schedule check** (slot
re-checked and held for 10 minutes) → the backend prices the booking and opens a Stripe PaymentIntent
(`POST /consultations/checkout`) → the patient pays in Stripe's Payment Element (card, Apple Pay, Google Pay,
Link) → the backend checks the payment with Stripe and saves the booking (`…/confirm`; the Stripe webhook
does the same if the page was closed) → receipt. In test mode use card `4242 4242 4242 4242` (success) or
`4000 0000 0000 0002` (declined).

Free cases: follow-up messages, consultations with a fee of 0 (set by admin for promos), and platform
support. Free bookings skip Stripe (`POST /consultations`).

Doctors are paid with **Stripe Connect**: they set up a Stripe Express account from Earnings, ask to
withdraw cleared money, and a super admin sends it from the dashboard (a Stripe transfer).
