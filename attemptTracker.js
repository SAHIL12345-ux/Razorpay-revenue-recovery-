const fs = require('fs');
const TRACKER_FILE = 'attempts.json';
const MAX_ATTEMPTS = 3;

function loadAttempts() {
  if (!fs.existsSync(TRACKER_FILE)) return {};
  return JSON.parse(fs.readFileSync(TRACKER_FILE, 'utf-8'));
}

function saveAttempts(attempts) {
  fs.writeFileSync(TRACKER_FILE, JSON.stringify(attempts, null, 2));
}

function getAttemptCount(subscriptionId) {
  const attempts = loadAttempts();
  return attempts[subscriptionId] || 0;
}

function recordAttempt(subscriptionId) {
  const attempts = loadAttempts();
  attempts[subscriptionId] = (attempts[subscriptionId] || 0) + 1;
  saveAttempts(attempts);
  return attempts[subscriptionId];
}

function hasReachedLimit(subscriptionId) {
  return getAttemptCount(subscriptionId) >= MAX_ATTEMPTS;
}

module.exports = { getAttemptCount, recordAttempt, hasReachedLimit, MAX_ATTEMPTS };