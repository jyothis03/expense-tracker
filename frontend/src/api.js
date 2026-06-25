/**
 * API client — all HTTP calls to the FastAPI backend.
 */

const BASE_URL = "http://localhost:8000/api";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (options.method === "DELETE" && res.status === 204) {
    return null;
  }

  const data = await res.json();

  if (!res.ok) {
    const message =
      data.detail ||
      (Array.isArray(data.detail)
        ? data.detail.map((e) => e.msg).join(", ")
        : "Something went wrong");
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

/** List expenses with optional filters */
export async function fetchExpenses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.search) params.set("search", filters.search);

  const qs = params.toString();
  return request(`${BASE_URL}/expenses${qs ? `?${qs}` : ""}`);
}

/** Create a new expense */
export async function createExpense(data) {
  return request(`${BASE_URL}/expenses`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Update an existing expense */
export async function updateExpense(id, data) {
  return request(`${BASE_URL}/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** Soft-delete an expense */
export async function deleteExpense(id) {
  return request(`${BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });
}

/** Restore a soft-deleted expense (undo) */
export async function restoreExpense(id) {
  return request(`${BASE_URL}/expenses/${id}/restore`, {
    method: "POST",
  });
}

/** Permanently delete an expense */
export async function permanentDeleteExpense(id) {
  return request(`${BASE_URL}/expenses/${id}/permanent`, {
    method: "DELETE",
  });
}

/** Get monthly summary */
export async function fetchSummary(month) {
  const params = month ? `?month=${month}` : "";
  return request(`${BASE_URL}/summary${params}`);
}
