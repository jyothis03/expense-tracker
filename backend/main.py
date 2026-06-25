"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from database import create_db_and_tables, engine
from routes import router
from seed import seed_expenses


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and seed sample data."""
    create_db_and_tables()
    with Session(engine) as session:
        seed_expenses(session)
    yield


app = FastAPI(
    title="Expense Tracker API",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
