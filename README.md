# Revenue Recovery Agent

An AI agent built for the Razorpay AI Buildathon — **Track 03: AI Revenue Recovery**.

The agent detects failed subscription payments, diagnoses the failure reason, decides on a bounded recovery action, executes it against the real Razorpay API, and logs a full audit trail — with a stopping rule so it never spams a customer indefinitely.

## The problem

Failed recurring payments (card expired, insufficient funds, bank timeout) quietly leak revenue. Most systems either do nothing, or blindly retry forever with no limit and no record of what happened. This agent closes that loop safely.

## How it works

```
Failed payment → Diagnose reason → Decide action → Execute (real API) → Log outcome
```

1. **Detect** — a failed payment record comes in (failure reason, amount, subscription ID)
2. **Diagnose** — the reason is classified: `insufficient_funds`, `card_expired`, `bank_timeout`
3. **Decide** — each reason maps to a specific recovery action:
   - `card_expired` → send a new payment link
   - `bank_timeout` → retry immediately
   - `insufficient_funds` → retry later
4. **Act** — for `send_payment_link`, the agent calls the real Razorpay Payment Links API and generates a live, working payment link
5. **Log** — every case (customer, amount, reason, action, outcome, timestamp) is saved to `results.json`, which the dashboard reads and displays

## Bounded execution (stopping rule)

Every subscription is capped at **3 recovery attempts**, tracked in `attempts.json`. Once the limit is hit, the agent stops taking action and marks the case as escalated for human review instead of retrying indefinitely. This is enforced in code before any action is taken — not just documented as a policy.

## What's real vs. simulated (full transparency)

Razorpay's API does not allow programmatically failing a real payment in test mode (by design — this is a security boundary, not a limitation of this project). So:

- **Detection input** (`failedPayments.js`) is a synthetic dataset shaped exactly like a real Razorpay webhook payload
- **Diagnosis, decision-making, and execution are 100% real** — the agent makes real Razorpay API calls and generates real, working payment links (e.g. `https://rzp.io/rzp/...`)
- **Audit logging and the stopping rule** operate on real API responses, not mocked ones

In production, `failedPayments.js` would be replaced by a Razorpay webhook listener — the agent logic itself would not change.

## Tech stack

- **Backend**: Node.js, Razorpay Node SDK
- **Dashboard**: React (Vite)
- **Data**: JSON file-based audit trail (`results.json`, `attempts.json`)

## Project structure

```
Razorpay-revenue-recovery/
├── index.js              # Orchestrates the agent loop
├── recoveryAgent.js       # Diagnose, decide, and act logic
├── attemptTracker.js      # Bounded retry / stopping rule
├── failedPayments.js      # Synthetic test dataset (webhook-shaped)
├── results.json           # Audit trail output
├── attempts.json          # Per-subscription attempt counts
└── dashboard/              # React dashboard (reads results.json)
```

## Running it

**Backend agent:**
```bash
npm install
node index.js
```

**Dashboard:**
```bash
cd dashboard
npm install
npm run dev
```

Then copy the latest results into the dashboard's public folder so it picks up fresh data:
```bash
copy results.json dashboard\public\results.json
```

You'll need a Razorpay test-mode account and API keys in a `.env` file:
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

## Results (sample run)

| Metric | Value |
|---|---|
| Total cases processed | 3 |
| Recovery links generated (real) | 1 |
| Cases escalated after 3 failed attempts | tested and confirmed working |

## What I'd build next with more time

- Replace the synthetic dataset with a real Razorpay webhook listener (Express endpoint)
- Add SMS/email delivery confirmation tracking, not just link generation
- Expand the test dataset to 50+ synthetic cases for stronger recovery-rate metrics
- Persist attempts/results in a real database instead of JSON files
