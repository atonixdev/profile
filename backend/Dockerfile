FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Copy project
COPY . /app/

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Create non-root user for security (match host user preference)
RUN useradd -m -u 1000 atonixdev && chown -R atonixdev:atonixdev /app
USER atonixdev

# Expose port
EXPOSE 8000

# Run init script (wait DB, create DB, makemigrations, migrate, seed, start gunicorn)
CMD ["sh", "/app/init.sh"]
