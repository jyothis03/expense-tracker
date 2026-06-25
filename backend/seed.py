"""Seed data — realistic sample expenses for the current month."""

import datetime as dt
from decimal import Decimal
from sqlmodel import Session, select

from models import Expense, CategoryEnum


SAMPLE_EXPENSES = [
    # Food
    {"title": "Morning Coffee", "amount": 180, "category": CategoryEnum.FOOD,
     "days_ago": 0, "note": "Cappuccino at Blue Tokai"},
    {"title": "Lunch with team", "amount": 650, "category": CategoryEnum.FOOD,
     "days_ago": 2, "note": "Biryani at Paradise"},
    {"title": "Groceries from BigBasket", "amount": 2350, "category": CategoryEnum.FOOD,
     "days_ago": 5, "note": "Weekly grocery run"},
    {"title": "Swiggy dinner", "amount": 480, "category": CategoryEnum.FOOD,
     "days_ago": 8, "note": None},
    # Transport
    {"title": "Uber to Office", "amount": 350, "category": CategoryEnum.TRANSPORT,
     "days_ago": 1, "note": "Surge pricing during rain"},
    {"title": "Metro card recharge", "amount": 500, "category": CategoryEnum.TRANSPORT,
     "days_ago": 10, "note": None},
    {"title": "Ola to Airport", "amount": 1200, "category": CategoryEnum.TRANSPORT,
     "days_ago": 14, "note": "Weekend trip to Goa"},
    # Shopping
    {"title": "Amazon Headphones", "amount": 1999, "category": CategoryEnum.SHOPPING,
     "days_ago": 3, "note": "Sony WH-1000XM5 on sale"},
    {"title": "Uniqlo T-shirts", "amount": 2490, "category": CategoryEnum.SHOPPING,
     "days_ago": 7, "note": "3x Dry-EX crew neck"},
    # Bills
    {"title": "Electricity Bill", "amount": 2400, "category": CategoryEnum.BILLS,
     "days_ago": 4, "note": "June billing cycle"},
    {"title": "Mobile Recharge", "amount": 599, "category": CategoryEnum.BILLS,
     "days_ago": 12, "note": "Jio annual plan"},
    {"title": "Internet Bill", "amount": 999, "category": CategoryEnum.BILLS,
     "days_ago": 6, "note": "ACT Fibernet 150 Mbps"},
    # Entertainment
    {"title": "Netflix Subscription", "amount": 649, "category": CategoryEnum.ENTERTAINMENT,
     "days_ago": 9, "note": "Monthly auto-renewal"},
    {"title": "Movie tickets — Pushpa 3", "amount": 750, "category": CategoryEnum.ENTERTAINMENT,
     "days_ago": 11, "note": "IMAX 3D, 2 tickets"},
    # Other
    {"title": "Gym membership", "amount": 3500, "category": CategoryEnum.OTHER,
     "days_ago": 13, "note": "Cult.fit quarterly plan"},
]


def seed_expenses(session: Session) -> None:
    """Insert sample expenses if the table is empty."""
    existing = session.exec(select(Expense)).first()
    if existing is not None:
        return  # already seeded

    today = dt.date.today()
    for item in SAMPLE_EXPENSES:
        expense_date = today - dt.timedelta(days=item["days_ago"])
        expense = Expense(
            title=item["title"],
            amount=Decimal(item["amount"]),
            category=item["category"],
            date=expense_date,
            note=item["note"],
        )
        session.add(expense)

    session.commit()
