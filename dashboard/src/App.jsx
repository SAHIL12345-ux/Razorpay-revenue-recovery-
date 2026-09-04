import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/results.json')
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load results:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>Loading...</p></div>;

  const totalCases = results.length;
  const stoppedCount = results.filter((r) => r.outcome.stopped).length;
  const activeActions = results.filter((r) => !r.outcome.stopped).length;
  const totalAmount = results.reduce((sum, r) => sum + r.amount, 0);
  const recoveredAmount = results
    .filter((r) => r.action_taken === 'send_payment_link' && r.outcome.success)
    .reduce((sum, r) => sum + r.amount, 0);

  const reasonColors = {
    insufficient_funds: '#e08e00',
    card_expired: '#3b5bfd',
    bank_timeout: '#8a3ffd',
  };

  return (
    <div className="container">
      <h1>Revenue Recovery Dashboard</h1>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{totalCases}</div>
          <div className="stat-label">Total Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeActions}</div>
          <div className="stat-label">Actions Taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">₹{totalAmount}</div>
          <div className="stat-label">Total At Risk</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-value">₹{recoveredAmount}</div>
          <div className="stat-label">Recovery Links Sent</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-value">{stoppedCount}</div>
          <div className="stat-label">Escalated (Limit Reached)</div>
        </div>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Amount</th>
            <th>Failure Reason</th>
            <th>Action Taken</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.customer_name}</td>
              <td>₹{r.amount}</td>
              <td>
                <span
                  className="reason-dot"
                  style={{ background: reasonColors[r.failure_reason] || '#999' }}
                ></span>
                {r.failure_reason}
              </td>
              <td><span className="badge">{r.action_taken}</span></td>
              <td>
                {r.outcome.stopped ? (
                  <span className="status-stopped">🛑 Escalated</span>
                ) : r.outcome.success ? (
                  <span className="status-success">✅ Success</span>
                ) : (
                  <span className="status-fail">❌ Failed</span>
                )}
              </td>
              <td>
                {r.outcome.stopped ? (
                  <span className="detail-note">{r.outcome.reason}</span>
                ) : r.outcome.link_url ? (
                  <>
                    <a href={r.outcome.link_url} target="_blank" rel="noreferrer">View Link</a>
                    <span className="attempt-tag"> (attempt {r.outcome.attempts})</span>
                  </>
                ) : (
                  <span className="detail-note">
                    {r.outcome.note} <span className="attempt-tag">(attempt {r.outcome.attempts})</span>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="disclaimer">
        Detection: simulated test data (mirrors real Razorpay webhook format) &nbsp;•&nbsp;
        Action: real Razorpay API calls &nbsp;•&nbsp;
        Max 3 attempts per subscription before escalation
      </div>
    </div>
  );
}

export default App;