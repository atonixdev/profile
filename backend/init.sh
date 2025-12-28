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
WAIT_SECONDS = int(os.environ.get('DB_WAIT_SECONDS', '180'))

# First check TCP port
def tcp_ready():
  try:
    with socket.create_connection((DB_HOST, DB_PORT), timeout=1):
      return True
  except Exception:
    return False

deadline = time.time() + WAIT_SECONDS
last_err = None
last_log = 0.0

while time.time() < deadline:
  if not tcp_ready():
    time.sleep(1)
    continue

  try:
    import psycopg2
    conn = psycopg2.connect(
      host=DB_HOST,
      port=DB_PORT,
      user=DB_USER,
      password=DB_PASSWORD,
      dbname='postgres',
      connect_timeout=3,
    )
    conn.close()
    sys.exit(0)
  except Exception as e:
    last_err = e
    now = time.time()
    if now - last_log >= 10:
      print(f"Still waiting for Postgres... ({type(e).__name__}: {e})", file=sys.stderr)
      last_log = now
    time.sleep(2)

msg = f"Postgres not ready after {WAIT_SECONDS}s"
if last_err is not None:
  msg += f": {type(last_err).__name__}: {last_err}"
print(msg, file=sys.stderr)
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
