"""REST API routes for expenses and monthly summary."""

import datetime as dt
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, col, func

from database import get_session
from models import (
    CategoryEnum,
    Expense,
    ExpenseCreate,
    ExpenseRead,
    ExpenseUpdate,
    MonthlySummary,
)

router = APIRouter(prefix="/api")


# ── Helpers ──────────────────────────────────────────────────


def _get_expense_or_404(
    expense_id: int, session: Session, *, allow_deleted: bool = False
) -> Expense:
    expense = session.get(Expense, expense_id)
    if expense is None or (expense.is_deleted and not allow_deleted):
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


# ── CRUD ─────────────────────────────────────────────────────


@router.get("/expenses", response_model=list[ExpenseRead])
def list_expenses(
    category: Optional[CategoryEnum] = None,
    date_from: Optional[dt.date] = None,
    date_to: Optional[dt.date] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
):
    """List expenses with optional filters, sorted newest-first."""
    stmt = select(Expense).where(Expense.is_deleted == False)  # noqa: E712

    if category is not None:
        stmt = stmt.where(Expense.category == category)
    if date_from is not None:
        stmt = stmt.where(Expense.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(Expense.date <= date_to)
    if search:
        stmt = stmt.where(col(Expense.title).ilike(f"%{search}%"))

    stmt = stmt.order_by(Expense.date.desc(), Expense.created_at.desc())
    return session.exec(stmt).all()


@router.post("/expenses", response_model=ExpenseRead, status_code=201)
def create_expense(
    body: ExpenseCreate,
    session: Session = Depends(get_session),
):
    """Create a new expense."""
    expense = Expense.model_validate(body)
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return expense


@router.get("/expenses/{expense_id}", response_model=ExpenseRead)
def get_expense(
    expense_id: int,
    session: Session = Depends(get_session),
):
    """Get a single expense by ID."""
    return _get_expense_or_404(expense_id, session)


@router.put("/expenses/{expense_id}", response_model=ExpenseRead)
def update_expense(
    expense_id: int,
    body: ExpenseUpdate,
    session: Session = Depends(get_session),
):
    """Update an existing expense (partial update)."""
    expense = _get_expense_or_404(expense_id, session)
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return expense


@router.delete("/expenses/{expense_id}", status_code=200)
def soft_delete_expense(
    expense_id: int,
    session: Session = Depends(get_session),
):
    """Soft-delete an expense (set is_deleted = True)."""
    expense = _get_expense_or_404(expense_id, session)
    expense.is_deleted = True
    session.add(expense)
    session.commit()
    return {"ok": True, "id": expense_id}


@router.post("/expenses/{expense_id}/restore", response_model=ExpenseRead)
def restore_expense(
    expense_id: int,
    session: Session = Depends(get_session),
):
    """Restore a soft-deleted expense (undo)."""
    expense = _get_expense_or_404(expense_id, session, allow_deleted=True)
    expense.is_deleted = False
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return expense


@router.delete("/expenses/{expense_id}/permanent", status_code=204)
def permanent_delete_expense(
    expense_id: int,
    session: Session = Depends(get_session),
):
    """Permanently delete an expense from the database."""
    expense = _get_expense_or_404(expense_id, session, allow_deleted=True)
    session.delete(expense)
    session.commit()
    return None


# ── Summary ──────────────────────────────────────────────────


@router.get("/summary", response_model=MonthlySummary)
def monthly_summary(
    month: Optional[str] = Query(
        None,
        pattern=r"^\d{4}-\d{2}$",
        description="Month in YYYY-MM format, defaults to current month",
    ),
    session: Session = Depends(get_session),
):
    """Get total spent and category breakdown for a given month."""
    if month is None:
        today = dt.date.today()
        month = today.strftime("%Y-%m")

    year, mon = map(int, month.split("-"))
    if mon < 1 or mon > 12:
        raise HTTPException(status_code=400, detail="Invalid month")

    # Calculate first and last day of month
    first_day = dt.date(year, mon, 1)
    if mon == 12:
        last_day = dt.date(year + 1, 1, 1)
    else:
        last_day = dt.date(year, mon + 1, 1)

    # Total
    total_result = session.exec(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.is_deleted == False,  # noqa: E712
            Expense.date >= first_day,
            Expense.date < last_day,
        )
    ).one()
    total = Decimal(str(total_result))

    # Breakdown by category
    rows = session.exec(
        select(Expense.category, func.sum(Expense.amount)).where(
            Expense.is_deleted == False,  # noqa: E712
            Expense.date >= first_day,
            Expense.date < last_day,
        ).group_by(Expense.category)
    ).all()

    breakdown = {row[0]: Decimal(str(row[1])) for row in rows}

    return MonthlySummary(month=month, total=total, breakdown=breakdown)


# ── AI Insights ──────────────────────────────────────────────


@router.get("/insights")
def ai_insights(
    month: Optional[str] = Query(
        None,
        pattern=r"^\d{4}-\d{2}$",
        description="Month in YYYY-MM format, defaults to current month",
    ),
    session: Session = Depends(get_session),
):
    """Generate AI-powered spending insights using Gemini 2.5 Flash.

    Returns {"available": false} if the API key is not configured or
    the model call fails — the frontend hides the insights card gracefully.
    """
    import os

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"available": False}

    # ── Resolve month ────────────────────────────────────────
    if month is None:
        today = dt.date.today()
        month = today.strftime("%Y-%m")

    year, mon = map(int, month.split("-"))
    if mon < 1 or mon > 12:
        return {"available": False, "error": "Invalid month"}

    first_day = dt.date(year, mon, 1)
    if mon == 12:
        last_day = dt.date(year + 1, 1, 1)
    else:
        last_day = dt.date(year, mon + 1, 1)

    # ── Gather expense data ──────────────────────────────────
    expenses = session.exec(
        select(Expense).where(
            Expense.is_deleted == False,  # noqa: E712
            Expense.date >= first_day,
            Expense.date < last_day,
        ).order_by(Expense.date.desc())
    ).all()

    if len(expenses) == 0:
        return {"available": False}

    total = float(sum(e.amount for e in expenses))
    breakdown: dict[str, float] = {}
    for e in expenses:
        breakdown[e.category] = breakdown.get(e.category, 0) + float(e.amount)

    expense_dicts = [
        {"date": str(e.date), "title": e.title, "amount": float(e.amount), "category": e.category}
        for e in expenses
    ]

    month_names = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]
    month_label = f"{month_names[mon - 1]} {year}"

    # ── Build prompt and call Gemini ─────────────────────────
    from prompts import INSIGHTS_SYSTEM_PROMPT, build_insights_user_prompt

    user_prompt = build_insights_user_prompt(month_label, total, breakdown, expense_dicts)

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=INSIGHTS_SYSTEM_PROMPT,
        )
        response = model.generate_content(
            user_prompt,
        )
        return {"available": True, "insights": response.text}
    except Exception as exc:
        return {"available": False, "error": str(exc)}

