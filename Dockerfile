FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
COPY backend/alembic.ini ./backend/alembic.ini
COPY backend/alembic/ ./alembic/
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY backend/ ./backend/
COPY frontend/dist/ ./frontend/dist/
RUN pip install alembic

# Set working directory for app
WORKDIR /app/backend

# Expose port
EXPOSE 8000

# Run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]