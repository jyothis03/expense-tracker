import { useState, useEffect } from "react";
import { fetchInsights } from "../api";

export default function AIInsights({ monthKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetchInsights(monthKey)
      .then(setData)
      .catch(() => setData({ available: false }))
      .finally(() => setLoading(false));
  }, [monthKey]);

  // Graceful degradation: hide entirely if unavailable
  if (!loading && (!data || !data.available)) {
    return null;
  }

  // Parse bullet points from the insights text
  const bullets = data?.insights
    ? data.insights
        .split("\n")
        .map((line) => line.replace(/^[\s•\-\*]+/, "").trim())
        .filter((line) => line.length > 0)
    : [];

  return (
    <div className="ai-insights glass">
      <div className="ai-insights__header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width="20"
          height="20"
          className="ai-insights__icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
          />
        </svg>
        <span className="ai-insights__title">AI Insights</span>
        <span className="ai-insights__badge">Gemini</span>
      </div>

      {loading ? (
        <div className="ai-insights__loading">
          <div className="ai-insights__shimmer" />
          <div className="ai-insights__shimmer ai-insights__shimmer--short" />
        </div>
      ) : (
        <ul className="ai-insights__list">
          {bullets.map((bullet, i) => (
            <li key={i} className="ai-insights__item">
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
