import { useState, useEffect } from "react";
import { fetchSummary } from "../api";

const CATEGORY_COLORS = {
  Food: "var(--cat-food)",
  Transport: "var(--cat-transport)",
  Shopping: "var(--cat-shopping)",
  Bills: "var(--cat-bills)",
  Entertainment: "var(--cat-entertainment)",
  Other: "var(--cat-other)",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SummaryDashboard() {
  const [summary, setSummary] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  useEffect(() => {
    setLoading(true);
    fetchSummary(monthKey)
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [monthKey]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const maxAmount = summary
    ? Math.max(...Object.values(summary.breakdown), 1)
    : 1;

  return (
    <div className="summary glass">
      <div className="summary__header">
        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Monthly Summary</h2>
        <div className="summary__month-nav">
          <button className="btn btn--ghost btn--sm btn--icon" onClick={prevMonth} aria-label="Previous month">
            ◀
          </button>
          <span className="summary__month-label">
            {MONTHS[month - 1]} {year}
          </span>
          <button className="btn btn--ghost btn--sm btn--icon" onClick={nextMonth} aria-label="Next month">
            ▶
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          Loading…
        </div>
      ) : (
        <>
          <div className="summary__total-card">
            <div className="summary__total-label">Total Spent</div>
            <div className="summary__total-amount">
              {formatCurrency(summary?.total || 0)}
            </div>
          </div>

          {summary && Object.keys(summary.breakdown).length > 0 ? (
            <div className="summary__breakdown">
              {Object.entries(summary.breakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div className="summary__bar-row" key={category}>
                    <span className="summary__bar-label">{category}</span>
                    <div className="summary__bar-track">
                      <div
                        className="summary__bar-fill"
                        style={{
                          width: `${(amount / maxAmount) * 100}%`,
                          background: CATEGORY_COLORS[category] || "var(--accent)",
                        }}
                      />
                    </div>
                    <span className="summary__bar-amount">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No expenses this month
            </div>
          )}
        </>
      )}
    </div>
  );
}
