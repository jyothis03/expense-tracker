"""Data models — Expense table + request/response schemas."""

import datetime as dt
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


class CategoryEnum(str, Enum):
    """Allowed expense categories."""

    FOOD = "Food"
    TRANSPORT = "Transport"
    SHOPPING = "Shopping"
    BILLS = "Bills"
    ENTERTAINMENT = "Entertainment"
    OTHER = "Other"


# ── Table model ──────────────────────────────────────────────


class Expense(SQLModel, table=True):
    """Expense row stored in SQLite."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(min_length=1, max_length=100, index=True)
    amount: Decimal = Field(gt=0, decimal_places=2, max_digits=10)
    category: CategoryEnum = Field(index=True)
    date: dt.date = Field(default_factory=dt.date.today, index=True)
    note: Optional[str] = Field(default=None, max_length=500)
    is_deleted: bool = Field(default=False)
    created_at: dt.datetime = Field(default_factory=dt.datetime.utcnow)


# ── Request schemas ──────────────────────────────────────────


class ExpenseCreate(SQLModel):
    """Body for POST /api/expenses."""

    title: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(gt=0, decimal_places=2, max_digits=10)
    category: CategoryEnum
    date: dt.date = Field(default_factory=dt.date.today)
    note: Optional[str] = Field(default=None, max_length=500)


class ExpenseUpdate(SQLModel):
    """Body for PUT /api/expenses/{id}.  All fields optional."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    amount: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2, max_digits=10)
    category: Optional[CategoryEnum] = None
    date: Optional[dt.date] = None
    note: Optional[str] = Field(default=None, max_length=500)


# ── Response schemas ─────────────────────────────────────────


class ExpenseRead(SQLModel):
    """Shape returned by GET endpoints."""

    id: int
    title: str
    amount: Decimal
    category: CategoryEnum
    date: dt.date
    note: Optional[str]
    created_at: dt.datetime


class MonthlySummary(SQLModel):
    """Shape returned by GET /api/summary."""

    month: str  # "YYYY-MM"
    total: Decimal
    breakdown: dict[CategoryEnum, Decimal]  # category -> total
