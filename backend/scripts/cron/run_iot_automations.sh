#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."  # backend/
source venv/bin/activate
python manage.py run_iot_scheduled_automations --event scheduler
