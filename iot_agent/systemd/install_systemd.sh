#!/usr/bin/env bash
set -euo pipefail

# Installs the Atonix IoT Agent as a systemd service on a Raspberry Pi.
# Assumes you deploy the agent to /opt/atonix/iot_agent

SERVICE_SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVICE_NAME="atonix-iot-agent.service"

TARGET_DIR="/opt/atonix/iot_agent"
ENV_DIR="/etc/atonix"
ENV_FILE="$ENV_DIR/iot_agent.env"

if [[ $EUID -ne 0 ]]; then
  echo "Please run as root: sudo $0" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR" "$ENV_DIR"

echo "Copy agent code to $TARGET_DIR (if not already deployed)."

echo "Installing systemd unit..."
install -m 0644 "$SERVICE_SRC_DIR/$SERVICE_NAME" "/etc/systemd/system/$SERVICE_NAME"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Creating env file: $ENV_FILE"
  install -m 0644 "$SERVICE_SRC_DIR/iot_agent.env.example" "$ENV_FILE"
  echo "Edit $ENV_FILE with your API/device token before starting."
fi

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

echo "Done. Start with: sudo systemctl start $SERVICE_NAME"
