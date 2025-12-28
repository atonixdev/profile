#!/usr/bin/env sh
set -e

# Wait for Postgres to be reachable using psycopg2
echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
python - <<'PYWAIT'
import os, time
import sys
import socket

DB_HOST = os.environ.get('DB_HOST', 'db')
DB_PORT = int(os.environ.get('DB_PORT', '5432'))
DB_USER = os.environ.get('DB_USER', 'postgres')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'postgres')

# First check TCP port
def tcp_ready():
  try:
    with socket.create_connection((DB_HOST, DB_PORT), timeout=1):
      return True
  except Exception:
    return False

while not tcp_ready():
  time.sleep(1)

# Then check Postgres auth
for _ in range(60):
  try:
    import psycopg2
    conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD, dbname='postgres')
    conn.close()
    sys.exit(0)
  except Exception:
    time.sleep(1)

print('Postgres not ready after timeout', file=sys.stderr)
sys.exit(1)
PYWAIT
echo "Postgres is up."

echo "Ensuring database '$DB_NAME' exists..."
EXISTS=$(psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" || true)
if [ "$EXISTS" != "1" ]; then
  psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/postgres" -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$DB_NAME\";" || echo "Could not create database (may already exist)."
else
  echo "Database '$DB_NAME' already exists."
fi

# Make and run migrations, then seed sample data
echo "Running Django migrations (ordered)..."
# Ensure core dependencies are migrated first to avoid inconsistent history
python manage.py migrate contenttypes --noinput
python manage.py migrate auth --noinput || true
python manage.py migrate --noinput
python manage.py add_sample_discussions || true
python manage.py add_sample_blogs || true

# Start ASGI server (supports WebSockets via Channels)
echo "Starting Daphne (ASGI)..."
exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
