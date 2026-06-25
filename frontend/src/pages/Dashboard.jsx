import SummaryDashboard from "../components/SummaryDashboard";

export default function Dashboard({ summaryKey }) {
  return (
    <div className="page dashboard-page">
      <SummaryDashboard key={summaryKey} />
    </div>
  );
}
