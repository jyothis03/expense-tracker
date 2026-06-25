import FilterBar from "../components/FilterBar";
import ExpenseList from "../components/ExpenseList";

export default function Expenses({ filters, setFilters, expenses, loading, onEdit, onDelete }) {
  return (
    <div className="page expenses-page">
      <FilterBar filters={filters} onFilterChange={setFilters} />
      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
