# Revenue Recovery Agent

An AI agent built for the Razorpay AI Buildathon — **Track 03: AI Revenue Recovery**.

The agent detects failed subscription payments, diagnoses the failure reason, decides on a bounded recovery action, executes it against the real Razorpay API, and logs a full audit trail — with a stopping rule so it never spams a customer indefinitely.

## The problem

Failed recurring payments (card expired, insufficient funds, bank timeout) quietly leak revenue. Most systems either do nothing, or blindly retry forever with no limit and no record of what happened. This agent closes that loop safely.

## How it works
