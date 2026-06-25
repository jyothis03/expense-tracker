const CATEGORY_CLASS = {
  Food: "cat--food",
  Transport: "cat--transport",
  Shopping: "cat--shopping",
  Bills: "cat--bills",
  Entertainment: "cat--entertainment",
  Other: "cat--other",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ExpenseList({ expenses, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">⏳</div>
        <div className="empty-state__title">Loading expenses…</div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📭</div>
        <div className="empty-state__title">No expenses found</div>
        <div className="empty-state__text">
          Try adjusting your filters, or add a new expense.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="expense-list__header">
        <span className="expense-list__count">
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="expense-list">
        {expenses.map((expense, index) => (
          <div
            key={expense.id}
            className={`expense-card glass glass--interactive ${CATEGORY_CLASS[expense.category] || ""}`}
            style={{ animationDelay: `${index * 0.04}s` }}
          >
            <div className="expense-card__color-dot" />

            <div className="expense-card__main">
              <div className="expense-card__top">
                <span className="expense-card__title">{expense.title}</span>
                <span className="expense-card__badge">{expense.category}</span>
              </div>
              <div className="expense-card__meta">
                <span>{formatDate(expense.date)}</span>
                {expense.note && (
                  <>
                    <span>·</span>
                    <span className="expense-card__note">{expense.note}</span>
                  </>
                )}
              </div>
            </div>

            <div className="expense-card__amount">
              {formatCurrency(expense.amount)}
            </div>

            <div className="expense-card__actions">
              <button
                className="btn btn--ghost btn--sm btn--icon"
                onClick={() => onEdit(expense)}
                title="Edit"
                aria-label={`Edit ${expense.title}`}
              >
                ✏️
              </button>
              <button
                className="btn btn--danger btn--sm btn--icon"
                onClick={() => onDelete(expense.id)}
                title="Delete"
                aria-label={`Delete ${expense.title}`}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
