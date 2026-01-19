# Atonix IoT Agent (systemd)

This folder provides a minimal Raspberry Pi autostart/self-healing setup for the IoT agent.

## Install

1) Deploy the agent to `/opt/atonix/iot_agent` (copy `agent.py`, `requirements.txt`, etc)
2) Create a venv and install deps:

```bash
sudo mkdir -p /opt/atonix/iot_agent
cd /opt/atonix/iot_agent
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

3) Install the service:

```bash
sudo ./install_systemd.sh
sudo systemctl start atonix-iot-agent.service
sudo systemctl status atonix-iot-agent.service
```

## Configure

Edit `/etc/atonix/iot_agent.env` (created from `iot_agent.env.example`).

## Logs

```bash
journalctl -u atonix-iot-agent.service -f
```
