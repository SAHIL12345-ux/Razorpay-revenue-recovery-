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
  const recoveredCount = results.filter((r) => r.outcome.success).length;
  const totalAmount = results.reduce((sum, r) => sum + r.amount, 0);
  const recoveredAmount = results
    .filter((r) => r.action_taken === 'send_payment_link' && r.outcome.success)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="container">
      <h1>Revenue Recovery Dashboard</h1>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{totalCases}</div>
          <div className="stat-label">Total Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{recoveredCount}</div>
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
              <td>{r.failure_reason}</td>
              <td><span className="badge">{r.action_taken}</span></td>
              <td>
                <span className={r.outcome.success ? 'status-success' : 'status-fail'}>
                  {r.outcome.success ? '✅ Success' : '❌ Failed'}
                </span>
              </td>
              <td>
                {r.outcome.link_url ? (
                  <a href={r.outcome.link_url} target="_blank" rel="noreferrer">View Link</a>
                ) : (
                  r.outcome.note || '-'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;