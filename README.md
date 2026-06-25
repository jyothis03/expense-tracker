# 💰 Expense Tracker

A personal expense tracker web app built with **FastAPI + React (Vite) + SQLite (SQLModel)**.

Track spending, view monthly summaries with category breakdowns, filter expenses, and manage them with soft-delete + undo.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=flat-square)
![Stack](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square)

---

## 🚀 How to Run

### Prerequisites

- **Python 3.11+** (tested with 3.13)
- **Node.js 18+** (tested with 22.14)

### 1. Backend

**API Key Setup (Required for AI Insights):**
The app uses Google's Gemini 2.5 Flash for natural language spending analysis. You need to set an API key:
1. Copy `backend/.env.example` to `backend/.env`
2. Add your key: `GEMINI_API_KEY=your_api_key_here`

*(Note: The app degrades gracefully. If no key is set, the AI Insights feature simply hides itself without throwing errors.)*

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv .venv

# Activate the virtual environment:
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Windows (CMD):
.venv\Scripts\activate.bat
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies and run
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

The API starts at `http://localhost:8000`. On first run, it creates `expenses.db` and seeds 15 sample expenses.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

> **Note:** Both servers must be running simultaneously. The frontend proxies API calls to `localhost:8000`.

---

## ✅ Features Completed

### Core (all done)

| Feature | Status |
|---------|--------|
| Add expense (title, amount, category, date, note) | ✅ |
| View expense list (sorted by date, most recent first) | ✅ |
| Edit any expense | ✅ |
| Delete any expense (soft-delete + 5s undo toast) | ✅ |
| Monthly summary (total + category breakdown) | ✅ |
| Filter by category | ✅ |
| Filter by date range (from/to) | ✅ |
| Filter by title (partial text match, debounced) | ✅ |
| Month navigation in summary (prev/next arrows) | ✅ |
| CSV Export of filtered expenses | ✅ |
| Multi-page routing (Dashboard vs Expenses) | ✅ |
| AI Spending Insights (Gemini 2.5 Flash) | ✅ |

### Edge Cases Handled

| Edge Case | Handling |
|-----------|----------|
| Empty expense list | Friendly empty state with message |
| Invalid amount (0, negative, non-numeric) | Server rejects with 422 + client-side validation |
| Empty title | Required field, validated both layers |
| Future dates | Allowed (pre-logging upcoming bills) |
| Date range where from > to | Returns empty results gracefully |
| Very long notes | Capped at 500 chars |
| No expenses in current month | Summary shows ₹0 with empty breakdown |
| Rapid delete + undo | Toast replaces previous, latest undo active |

### Design

- Dark-mode glassmorphism UI
- Interactive Donut Pie Chart + Bar charts (via Recharts)
- Animated card list with staggered fade-in
- Modal with keyboard dismiss (Escape) and overlay click
- Responsive multi-page layout (React Router)
- Professional SVG icons (Heroicons)
- Google Fonts (Inter) for clean typography

---

## 🏗️ Stack Choices & Tradeoffs

### Why FastAPI + SQLModel?

**FastAPI** gives automatic request validation via Pydantic, auto-generated OpenAPI docs (`/docs`), and async support — all for very little boilerplate. **SQLModel** (by the same author) bridges Pydantic and SQLAlchemy, so the same model class serves as both the database table definition and the API schema. This eliminates the "two models" problem.

**Tradeoff:** SQLModel is relatively young and has some quirks (e.g., field name `date` clashing with the `date` type in newer Pydantic). We worked around this by importing `datetime as dt`.

### Why SQLite?

For a single-user local app, SQLite is the obvious choice: zero config, no server process, just a file. It still gives full SQL with indexing, aggregation, and filtering — which we use heavily for the summary and filter endpoints.

**Tradeoff:** No concurrent write support, but irrelevant for single-user.

### Why React + Vite (vanilla CSS)?

React provides a good component model for the interactive features (modal, toast, filters). We use React Router for clean multi-page navigation. Vite gives instant HMR and zero-config JSX support. Vanilla CSS (with custom properties) avoids build-tool complexity from Tailwind/CSS-in-JS while still enabling a polished design system.

**Tradeoff:** More CSS to write manually, but full control over the glassmorphism aesthetic.

### Why soft-delete with undo toast?

Prevents accidental data loss without the jarring "Are you sure?" dialog. The expense is marked `is_deleted=True` immediately (so it disappears from the list), then permanently deleted after 5 seconds. Clicking "Undo" restores it.

**Tradeoff:** Slightly more complex state management (3 API calls: soft-delete, restore, permanent-delete) but much better UX.

### Why Prompts in `prompts.py`?

Treating AI prompts as first-class artifacts (rather than hardcoding them in route handlers) is a core AI engineering practice. It decouples the prompt logic from the HTTP logic, making the prompts easier to version, test, and swap out independently.

---

## 📁 Project Structure

```
expense_tracker/
├── backend/
│   ├── main.py            # FastAPI app, CORS, lifespan
│   ├── database.py        # SQLite engine + session dependency
│   ├── models.py          # SQLModel table + request/response schemas
│   ├── prompts.py         # AI system prompt and user prompt builder
│   ├── routes.py          # REST API endpoints (CRUD + summary + insights)
│   ├── seed.py            # 15 sample expenses
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Root component, router setup
│   │   ├── api.js         # Fetch-based API client
│   │   ├── index.css      # Full design system (dark glassmorphism)
│   │   ├── main.jsx       # React entry point
│   │   ├── pages/         # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   └── Expenses.jsx
│   │   └── components/
│   │       ├── NavBar.jsx            # Top navigation
│   │       ├── SummaryDashboard.jsx  # Stats + Recharts Pie/Bar
│   │       ├── FilterBar.jsx         # Category, date range, search
│   │       ├── ExpenseList.jsx       # Card list + CSV Export
│   │       ├── ExpenseModal.jsx      # Add/edit form modal
│   │       └── Toast.jsx             # Undo delete notification
│   ├── index.html
│   └── package.json
└── README.md
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/expenses` | List (with filter query params) |
| `POST` | `/api/expenses` | Create |
| `GET` | `/api/expenses/:id` | Get one |
| `PUT` | `/api/expenses/:id` | Update (partial) |
| `DELETE` | `/api/expenses/:id` | Soft-delete |
| `POST` | `/api/expenses/:id/restore` | Undo delete |
| `DELETE` | `/api/expenses/:id/permanent` | Permanent delete |
| `GET` | `/api/summary?month=YYYY-MM` | Monthly summary |
| `GET` | `/api/insights?month=YYYY-MM` | Gemini AI spending insights |

---

## ⚠️ Known Rough Edges

1. **No persistent filter state** — filters reset on page refresh (no URL query param sync).
2. **Summary refreshes via key remount** — works but causes a brief flash; a context-based approach would be smoother.
3. **No pagination** — all expenses load at once. Fine for personal use (<1000 expenses), but would need pagination for larger datasets.
4. **`datetime.utcnow()` deprecation** — Python 3.12+ deprecates this; using it for simplicity but should migrate to `datetime.now(UTC)`.
5. **No authentication** — single-user app by design, per spec.
6. **Currency hardcoded** — INR (₹) is hardcoded in the frontend formatting.

---

## 🚫 What Was Skipped (and Why)

| Feature | Reason |
|---------|--------|
| Test suite | Explicitly out of scope per spec |
| Authentication | Single-user app, no multi-user support needed |
| Deployment | Runs locally only, per spec |
| Pagination | Overkill for personal expense tracking volumes |
| URL-synced filters | Nice-to-have, not essential for the core UX |
