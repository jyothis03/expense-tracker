import { useState, useEffect, useCallback, useRef } from "react";
import "./index.css";
import SummaryDashboard from "./components/SummaryDashboard";
import FilterBar from "./components/FilterBar";
import ExpenseList from "./components/ExpenseList";
import ExpenseModal from "./components/ExpenseModal";
import Toast from "./components/Toast";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  restoreExpense,
  permanentDeleteExpense,
} from "./api";

export default function App() {
  // ── State ──────────────────────────────────────────────────
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [toast, setToast] = useState(null);
  const summaryRef = useRef(null);

  // ── Data fetching ──────────────────────────────────────────

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses(filters);
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Force summary refresh
  const refreshSummary = () => {
    // Increment key to force remount
    setSummaryKey((k) => k + 1);
  };
  const [summaryKey, setSummaryKey] = useState(0);

  // ── Handlers ───────────────────────────────────────────────

  const handleSave = async (data, id) => {
    if (id) {
      await updateExpense(id, data);
    } else {
      await createExpense(data);
    }
    loadExpenses();
    refreshSummary();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  const handleDelete = async (id) => {
    // If a toast is already active, force its expiration to complete that deletion
    if (toast) {
      await handleToastExpire(toast.id);
    }
    // Remove from local list immediately
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    // Show undo toast
    setToast({ id });
  };

  const handleUndo = (id) => {
    setToast(null);
    // Reload from backend (the item was never actually deleted there yet)
    loadExpenses();
  };

  const handleToastExpire = async (id) => {
    try {
      await permanentDeleteExpense(id);
      refreshSummary(); // Update summary only after actual deletion
    } catch (err) {
      console.error("Failed to permanently delete:", err);
    }
    setToast((prev) => (prev && prev.id === id ? null : prev));
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="header__title">Expense Tracker</h1>
          <p className="header__subtitle">Track your spending, stay in control</p>
        </div>
        <button className="btn btn--primary" onClick={handleAdd}>
          + Add Expense
        </button>
      </header>

      <SummaryDashboard key={summaryKey} />

      <FilterBar filters={filters} onFilterChange={setFilters} />

      <ExpenseList
        expenses={expenses}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ExpenseModal
        isOpen={modalOpen}
        expense={editingExpense}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <Toast
        toast={toast}
        onUndo={handleUndo}
        onExpire={handleToastExpire}
      />
    </div>
  );
}
