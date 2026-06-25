"""Database setup — SQLite via SQLModel."""

from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///expenses.db"

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables():
    """Create all tables defined by SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a database session."""
    with Session(engine) as session:
        yield session
