module.exports = [
  {
    id: 'pay_fail_001',
    customer_name: 'Rahul Sharma',
    customer_contact: '+919876543210',
    amount: 49900, // paise
    currency: 'INR',
    failure_reason: 'insufficient_funds',
    subscription_id: 'sub_001',
    failed_at: Date.now(),
  },
  {
    id: 'pay_fail_002',
    customer_name: 'Priya Verma',
    customer_contact: '+919876543211',
    amount: 99900,
    currency: 'INR',
    failure_reason: 'card_expired',
    subscription_id: 'sub_002',
    failed_at: Date.now(),
  },
  {
    id: 'pay_fail_003',
    customer_name: 'Amit Singh',
    customer_contact: '+919876543212',
    amount: 29900,
    currency: 'INR',
    failure_reason: 'bank_timeout',
    subscription_id: 'sub_003',
    failed_at: Date.now(),
  },
];