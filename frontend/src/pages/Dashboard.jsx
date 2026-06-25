import { useState } from "react";
import SummaryDashboard from "../components/SummaryDashboard";
import AIInsights from "../components/AIInsights";

export default function Dashboard({ summaryKey }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <div className="page dashboard-page">
      <SummaryDashboard
        key={summaryKey}
        year={year}
        month={month}
        setYear={setYear}
        setMonth={setMonth}
      />
      <AIInsights monthKey={monthKey} />
    </div>
  );
}
