"""Prompt templates for AI-powered spending insights.

Prompts are treated as first-class artifacts — versioned, testable,
and decoupled from route logic. This makes iteration on prompt quality
independent of API plumbing changes.
"""

INSIGHTS_SYSTEM_PROMPT = """\
You are a concise, data-driven personal finance analyst embedded in an expense tracker app.

Rules:
- Output exactly 2–3 bullet points (use • as the bullet character).
- Each bullet should be one sentence, max two.
- Reference specific numbers (amounts in ₹, percentages, category names, dates).
- Compare against the month's own averages and totals — do NOT hallucinate prior months.
- If spending is concentrated in one category, call it out.
- Identify the single biggest expense by name if it stands out.
- Keep the tone helpful and neutral — no lecturing, no emojis.
- If there are very few expenses (< 3), note that more data would improve insights.
"""


def build_insights_user_prompt(
    month_label: str,
    total: float,
    breakdown: dict[str, float],
    expenses: list[dict],
) -> str:
    """Assemble the user message from structured expense data.

    Args:
        month_label: Human-readable month, e.g. "June 2026".
        total: Total amount spent in the month.
        breakdown: Category → total amount mapping.
        expenses: List of dicts with keys: date, title, amount, category.

    Returns:
        Formatted user prompt string ready to send to the model.
    """
    lines = [
        f"Month: {month_label}",
        f"Total spent: ₹{total:,.0f}",
        "",
        "Category breakdown:",
    ]

    for category, amount in sorted(breakdown.items(), key=lambda x: -x[1]):
        pct = (amount / total * 100) if total > 0 else 0
        lines.append(f"  {category}: ₹{amount:,.0f} ({pct:.0f}%)")

    lines.append("")
    lines.append(f"Individual expenses ({len(expenses)} total):")

    for exp in expenses:
        lines.append(f"  {exp['date']} | {exp['title']} | ₹{exp['amount']:,.0f} | {exp['category']}")

    return "\n".join(lines)
