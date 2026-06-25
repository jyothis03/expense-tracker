import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Food", label: "Food" },
  { value: "Transport", label: "Transport" },
  { value: "Shopping", label: "Shopping" },
  { value: "Bills", label: "Bills" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Other", label: "Other" },
];

export default function FilterBar({ filters, onFilterChange }) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ ...filters, search: localSearch || undefined });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [localSearch]);

  // Sync external filter changes
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters =
    filters.category || filters.date_from || filters.date_to || filters.search;

  const clearFilters = () => {
    setLocalSearch("");
    onFilterChange({});
  };

  return (
    <div className="filters glass">
      <div className="filters__row">
        <div className="filters__group">
          <span className="filters__label">Category</span>
          <select
            className="filters__select"
            value={filters.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filters__group">
          <span className="filters__label">From</span>
          <input
            type="date"
            className="filters__input"
            value={filters.date_from || ""}
            onChange={(e) => handleChange("date_from", e.target.value)}
          />
        </div>

        <div className="filters__group">
          <span className="filters__label">To</span>
          <input
            type="date"
            className="filters__input"
            value={filters.date_to || ""}
            onChange={(e) => handleChange("date_to", e.target.value)}
          />
        </div>

        <div className="filters__group">
          <span className="filters__label">Search</span>
          <input
            type="text"
            className="filters__input"
            placeholder="Search expenses…"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <div className="filters__actions">
            <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
              ✕ Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
