import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from db.models import Base  # your declarative models are defined here

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL not found")

print(f"Using database URL: {DATABASE_URL}")

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Create all tables automatically if they don't exist
Base.metadata.create_all(bind=engine)