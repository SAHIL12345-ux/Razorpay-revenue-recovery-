require('dotenv').config();
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// STEP 2: DIAGNOSE + STEP 3: DECIDE
function decideAction(failureReason) {
  switch (failureReason) {
    case 'insufficient_funds':
      return { action: 'retry_later', message: 'Balance kam tha, thodi der baad dobara try karenge.' };
    case 'card_expired':
      return { action: 'send_payment_link', message: 'Card expire ho gaya, naya payment link bhejenge.' };
    case 'bank_timeout':
      return { action: 'retry_now', message: 'Bank timeout hua, turant retry karenge.' };
    default:
      return { action: 'send_payment_link', message: 'Reason unclear, safe option: payment link bhejo.' };
  }
}
// STEP 4: ACT — real Razorpay Payment Link banao
async function executeAction(payment, decision) {
  if (decision.action === 'send_payment_link') {
    try {
      const link = await instance.paymentLink.create({
        amount: payment.amount,
        currency: payment.currency,
        description: `Recovery payment for ${payment.subscription_id}`,
        customer: {
          name: payment.customer_name,
          contact: payment.customer_contact,
        },
        notify: { sms: true, email: false },
      });
      return { success: true, link_url: link.short_url, link_id: link.id };
    } catch (error) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  }
   return { success: true, simulated: true, note: `Simulated: ${decision.action}` };
}

module.exports = { instance, decideAction,executeAction };