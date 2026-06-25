import { useState, useEffect } from "react";
import { fetchSummary } from "../api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

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

export default function SummaryDashboard({ year, month, setYear, setMonth }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("pie");

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

  const chartData = summary
    ? Object.entries(summary.breakdown)
        .map(([name, value]) => ({ name, value: Number(value) }))
        .sort((a, b) => b.value - a.value)
    : [];

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

          {chartData.length > 0 ? (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                <button 
                  className="btn btn--ghost btn--sm" 
                  onClick={() => setViewType(prev => prev === "pie" ? "bars" : "pie")}
                >
                  {viewType === "pie" ? "Show Bars" : "Show Pie Chart"}
                </button>
              </div>

              {viewType === "pie" ? (
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || "var(--accent)"} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'rgba(20, 20, 20, 0.85)', 
                          border: '1px solid var(--glass-border)', 
                          borderRadius: '8px',
                          color: '#fff',
                          backdropFilter: 'blur(10px)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 500 }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: "0.85rem", paddingTop: "1rem" }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
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
              )}
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
