import { useState, useEffect } from "react";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

const INITIAL_FORM = {
  title: "",
  amount: "",
  category: "Food",
  date: todayStr(),
  note: "",
};

export default function ExpenseModal({ isOpen, expense, onClose, onSave }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = !!expense;

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title || "",
        amount: String(expense.amount || ""),
        category: expense.category || "Food",
        date: expense.date || todayStr(),
        note: expense.note || "",
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
    setServerError("");
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (form.title.length > 100) errs.title = "Title must be under 100 characters";

    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount)) errs.amount = "Amount is required";
    else if (amount <= 0) errs.amount = "Amount must be greater than 0";

    if (!form.date) errs.date = "Date is required";
    if (form.note && form.note.length > 500) errs.note = "Note must be under 500 characters";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setServerError("");

    try {
      const data = {
        title: form.title.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        note: form.note.trim() || null,
      };
      await onSave(data, expense?.id);
      onClose();
    } catch (err) {
      setServerError(err.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-labelledby="modal-title">
        <h2 className="modal__title" id="modal-title">
          {isEdit ? "Edit Expense" : "Add Expense"}
        </h2>

        {serverError && <div className="modal__error">{serverError}</div>}

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label htmlFor="expense-title">Title</label>
            <input
              id="expense-title"
              type="text"
              placeholder="e.g., Coffee at Starbucks"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              autoFocus
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label htmlFor="expense-amount">Amount (₹)</label>
              <input
                id="expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>

            <div className="modal__field">
              <label htmlFor="expense-category">Category</label>
              <select
                id="expense-category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal__field">
            <label htmlFor="expense-date">Date</label>
            <input
              id="expense-date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          <div className="modal__field">
            <label htmlFor="expense-note">Note (optional)</label>
            <textarea
              id="expense-note"
              placeholder="Add a note…"
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
            />
            {errors.note && <span className="error-text">{errors.note}</span>}
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
