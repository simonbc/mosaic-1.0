"""Add unique constraint to handle

Revision ID: 1d19d3aab62a
Revises: 9d950c24a27a
Create Date: 2025-06-19 13:57:39.362311

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d19d3aab62a'
down_revision: Union[str, Sequence[str], None] = '9d950c24a27a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_unique_constraint(
        "uq_handle",     # name of the constraint
        "handles",       # table name
        ["handle"]       # column(s)
    )

def downgrade() -> None:
    op.drop_constraint(
        "uq_handle",     # name of the constraint
        "handles",       # table name
        type_="unique"
    )
