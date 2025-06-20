from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_id_column_to_handles'
down_revision = '1d19d3aab62a'  # Change this to the actual previous revision
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('handles', sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True))

def downgrade():
    op.drop_column('handles', 'id')