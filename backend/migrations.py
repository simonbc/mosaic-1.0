

from alembic import command
from alembic.config import Config
from sqlalchemy import text
from db.session import engine
import os

def run_migrations():
    print("📦 Running Alembic migrations...")

    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "alembic.ini"))

    with engine.connect() as conn:
        result = conn.execute(text("SELECT version_num FROM alembic_version"))
        version = result.scalar()

        if not version:
            print("⚠️ No Alembic version found. Stamping to head.")
            command.stamp(alembic_cfg, "head")
        else:
            print(f"ℹ️ Found Alembic version: {version}. Running upgrade to head.")
            command.upgrade(alembic_cfg, "head")

    print("✅ Migrations complete.")