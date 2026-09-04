require('dotenv').config();
const fs = require('fs');
const Razorpay = require('razorpay');
const failedPayments = require('./failedPayments');       
const { decideAction , executeAction } = require('./recoveryAgent');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Test connection: create a small test order
async function runAgent() {
  console.log('--- Failed Payments Recovery Agent ---\n');
  const results = [];

  for (const payment of failedPayments) {
    const decision = decideAction(payment.failure_reason);
    const outcome = await executeAction(payment, decision);

    const record = {
      customer_name: payment.customer_name,
      amount: payment.amount / 100,
      failure_reason: payment.failure_reason,
      action_taken: decision.action,
      outcome,
      timestamp: new Date().toISOString(),
    };

    results.push(record);

    console.log(`${payment.customer_name} | ₹${record.amount} | ${payment.failure_reason} → ${decision.action}`);
    if (outcome.stopped) console.log(`   🛑 STOPPED: ${outcome.reason}`);
    if (outcome.link_url) console.log(`   🔗 Payment link: ${outcome.link_url}`);
    if (outcome.success === false && !outcome.stopped) console.log(`   ❌ Failed: ${outcome.error}`);
  }

  // STEP 5: LOG — audit trail file mein save karo
  fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Saved audit trail to results.json');
}

runAgent();

