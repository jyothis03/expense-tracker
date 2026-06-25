import { NavLink } from "react-router-dom";

export default function NavBar({ onAddExpense }) {
  return (
    <header className="header nav-header">
      <div className="nav-header__brand">
        <h1 className="header__title">Expense Tracker</h1>
      </div>
      <nav className="nav-header__links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link--active" : ""}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/expenses"
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link--active" : ""}`
          }
        >
          Expenses
        </NavLink>
        <button className="btn btn--primary nav-header__add-btn" onClick={onAddExpense}>
          + Add
        </button>
      </nav>
    </header>
  );
}
