# 💰 Expense Tracker

An AI-powered personal expense tracker built with **FastAPI + React (Vite) + SQLite (SQLModel)**.

Track your spending, get natural language AI insights on your monthly habits, view category breakdowns, and manage your data with robust soft-delete capabilities.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![Stack](https://img.shields.io/badge/Frontend-React_+_Vite-61DAFB?style=flat-square)
![Stack](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square)

---

## 🧠 How & Why It Was Built

This project was built with a strong focus on **AI Engineering** and **Production Readiness**:
- **AI as a Feature, Not a Gimmick**: The Gemini integration isn't just an API call shoved into a route. Prompts are treated as first-class artifacts (`prompts.py`) decoupled from the REST plumbing. This allows for independent iteration on prompt quality.
- **Graceful Degradation**: If the Gemini API key is missing or the API call fails, the application doesn't crash. The backend safely catches the error and returns an `available: false` flag, and the frontend silently hides the AI Insights card, ensuring the core app remains 100% usable.
- **Robust Data Handling**: We use `SQLModel` to bridge SQLAlchemy and Pydantic, ensuring that the exact same schema validates incoming requests and defines the database tables.

---

## ✨ Features

- **AI Spending Insights**: Get 2-3 data-driven, natural language bullet points analyzing your month's spending (powered by Gemini 2.5 Flash).
- **Interactive Dashboards**: Toggle between Donut Pie Charts and Bar Charts for category breakdowns.
- **Expense Management**: Add, edit, and delete expenses (Title, Amount, Category, Date, Note).
- **Safe Deletion**: Soft-delete functionality with a 5-second "Undo" toast before permanent deletion.
- **Advanced Filtering**: Filter by Category, Date Range (From/To), and a debounced Title search.
- **CSV Export**: Export your currently filtered view to a clean CSV file with one click.
- **Responsive Design**: Dark-mode glassmorphism UI that feels premium and dynamic.

---

## 🚀 Running Instructions

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**

### 1. Backend (FastAPI)

**⚠️ IMPORTANT: Gemini API Key Setup**
To enable AI Insights, you *must* add your Gemini API key.
1. Navigate to the `backend/` directory.
2. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and add your key: `GEMINI_API_KEY=your_actual_api_key_here`

**Run the Server:**
```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# Windows (PowerShell): .venv\Scripts\Activate.ps1
# Mac/Linux: source .venv/bin/activate

# Install dependencies explicitly to the active python environment
python -m pip install -r requirements.txt

# Start the server
python -m uvicorn main:app --reload --port 8000
```
*(On the first run, it will automatically create `expenses.db` and seed it with 15 sample transactions).*

### 2. Frontend (React + Vite)

Open a **new** terminal window:
```bash
cd frontend
npm install
npm run dev
```
The app will open at `http://localhost:5173`. Both servers must be running simultaneously!

---

## 🏗️ Stack Choices & Tradeoffs

### Backend
- **FastAPI + SQLModel**: Chosen for incredible developer velocity and automatic OpenAPI (`/docs`) generation. SQLModel eliminates the "two models" problem by merging SQLAlchemy tables and Pydantic validation schemas.
  * *Tradeoff*: SQLModel is newer than SQLAlchemy and has minor namespace quirks (like clashing with the Pydantic `date` type), requiring careful imports.
- **SQLite**: Perfect for a local, single-user tool. Zero configuration required.
  * *Tradeoff*: No concurrent write support, which is entirely fine for a personal tracker.

### Frontend
- **React + Vite**: Instant hot-module replacement and a massive ecosystem for charts.
- **Recharts**: Simple, declarative composable charts that work flawlessly with React.
- **Vanilla CSS (Custom Properties)**: Used to achieve a highly customized, premium glassmorphic dark mode without the build overhead of Tailwind or CSS-in-JS.
  * *Tradeoff*: Requires manually writing and organizing CSS classes.

---

## 🛡️ Edge Cases Handled

1. **Empty States**: If no expenses exist for a month, the UI renders a friendly "No expenses found" graphic instead of blank charts or broken UI elements.
2. **Invalid Inputs**: 
   - Trying to submit a negative amount (`-50`), string (`"abc"`), or $0 is caught instantly by both Frontend Form validation *and* Backend Pydantic validation (`gt=0`).
3. **Weird Date Ranges**: 
   - Setting a filter where `From Date` > `To Date` safely returns `[]` without throwing SQL errors.
   - Requesting `month=2026-15` to the summary/insights API throws a clean `400 Bad Request` caught by our Regex validator.
4. **Future Dates**: Allowed by design to let users pre-log upcoming expected bills.
5. **No AI Key**: As mentioned, gracefully bypasses the AI call and hides the UI element.

---

## ⚖️ What's Done vs. What's Skipped

### Done (Focus Areas)
- **Backend**: Strict Pydantic request validation, decoupled AI prompt architecture, soft-delete system, relational querying for aggregations.
- **Frontend**: Full CRUD integration, debounced search, CSV generation, interactive visualizations.

### Skipped (Out of Scope)
- **Authentication (Backend)**: Skipped. This is designed as a single-user local tool.
- **Pagination (Backend)**: Skipped. For personal tracking (<2,000 rows a year), returning all rows sorted by date is performant enough and simplifies frontend filtering.
- **Test Suite**: Explicitly skipped to focus on shipping core features rapidly.
- **URL-Synced Filters (Frontend)**: Skipped. If you refresh the page, your search/category filters reset.

---

## ⚠️ Known Rough Edges
1. **Summary Refresh Flash**: When an expense is added/deleted, the summary chart forces a component remount via a `key` prop increment. This works perfectly but causes a brief visual flash.
2. **Hardcoded Currency**: The app assumes INR (₹) across the board.
3. **Python 3.12+ `datetime.utcnow()` Warning**: Using `utcnow()` which is deprecated in newer Python versions in favor of timezone-aware datetimes.
4. **No AI Caching**: Currently, the app fetches AI insights fresh every time the component loads. Adding Redis (backend) or Local Storage (frontend) caching would be much better to reduce API costs and latency.
