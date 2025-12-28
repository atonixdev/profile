#!/usr/bin/env python3

import os
import sys
import time
import json
import tempfile
import subprocess
from typing import Optional

import requests

try:
    import psutil
except Exception:
    psutil = None


def env(name: str, default: Optional[str] = None) -> str:
    v = os.environ.get(name)
    if v is None:
        if default is None:
            raise RuntimeError(f"Missing env var {name}")
        return default
    return v


API_BASE = env('ATONIX_API_BASE', 'http://localhost:8000/api').rstrip('/')
DEVICE_ID = env('ATONIX_DEVICE_ID')
DEVICE_TOKEN = env('ATONIX_DEVICE_TOKEN')

POLL_SECONDS = float(env('ATONIX_POLL_SECONDS', '2.0'))
HEARTBEAT_SECONDS = float(env('ATONIX_HEARTBEAT_SECONDS', '10.0'))
RUN_TIMEOUT_SECONDS = float(env('ATONIX_RUN_TIMEOUT_SECONDS', '15.0'))


def headers():
    return {
        'X-Device-Id': str(DEVICE_ID),
        'X-Device-Token': str(DEVICE_TOKEN),
        'Content-Type': 'application/json',
    }


def post_json(path: str, payload: dict):
    url = f"{API_BASE}{path}"
    resp = requests.post(url, headers=headers(), data=json.dumps(payload), timeout=10)
    resp.raise_for_status()
    return resp.json() if resp.content else None


def get_json(path: str, params: Optional[dict] = None):
    url = f"{API_BASE}{path}"
    resp = requests.get(url, headers=headers(), params=params, timeout=10)
    resp.raise_for_status()
    return resp.json()


def send_heartbeat():
    metrics = {}
    if psutil:
        try:
            metrics['cpu_percent'] = psutil.cpu_percent(interval=0.1)
            mem = psutil.virtual_memory()
            metrics['mem_percent'] = mem.percent
        except Exception:
            pass

    # temp is platform-specific; keep optional
    metrics.setdefault('temp_c', None)

    post_json('/iot-lab/agent/heartbeat/', {
        'status': 'online',
        'metrics': metrics,
        'metadata': {
            'agent_version': '0.1.0',
            'capabilities': {
                'run_python': True,
            },
        },
    })


def log_line(command_id: int, stream: str, message: str):
    post_json(f"/iot-lab/agent/commands/{command_id}/log/", {
        'stream': stream,
        'message': message,
    })


def run_python(command_id: int, code: str):
    post_json(f"/iot-lab/agent/commands/{command_id}/start/", {})

    stdout_lines = []
    stderr_lines = []

    with tempfile.TemporaryDirectory(prefix='atonix_iot_') as tmp:
        script_path = os.path.join(tmp, 'main.py')
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(code)

        proc = subprocess.Popen(
            [sys.executable, '-u', script_path],
            cwd=tmp,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )

        start = time.time()

        try:
            # Read output line-by-line while process runs
            while True:
                if proc.stdout is not None:
                    line = proc.stdout.readline()
                    if line:
                        line = line.rstrip('\n')
                        stdout_lines.append(line)
                        try:
                            log_line(command_id, 'stdout', line)
                        except Exception:
                            pass
                if proc.stderr is not None:
                    line = proc.stderr.readline()
                    if line:
                        line = line.rstrip('\n')
                        stderr_lines.append(line)
                        try:
                            log_line(command_id, 'stderr', line)
                        except Exception:
                            pass

                rc = proc.poll()
                if rc is not None:
                    break

                if time.time() - start > RUN_TIMEOUT_SECONDS:
                    proc.kill()
                    stderr_lines.append(f"Timed out after {RUN_TIMEOUT_SECONDS}s")
                    try:
                        log_line(command_id, 'stderr', f"Timed out after {RUN_TIMEOUT_SECONDS}s")
                    except Exception:
                        pass
                    rc = 124
                    break

                time.sleep(0.05)

            exit_code = proc.returncode if proc.returncode is not None else rc

            post_json(f"/iot-lab/agent/commands/{command_id}/finish/", {
                'status': 'succeeded' if exit_code == 0 else 'failed',
                'exit_code': int(exit_code) if exit_code is not None else None,
                'stdout': '\n'.join(stdout_lines),
                'stderr': '\n'.join(stderr_lines),
                'error': '',
            })

        except Exception as e:
            try:
                post_json(f"/iot-lab/agent/commands/{command_id}/finish/", {
                    'status': 'failed',
                    'exit_code': 1,
                    'stdout': '\n'.join(stdout_lines),
                    'stderr': '\n'.join(stderr_lines),
                    'error': str(e),
                })
            except Exception:
                pass


def handle_command(cmd: dict):
    command_id = int(cmd['id'])
    kind = cmd.get('kind')
    payload = cmd.get('payload') or {}

    try:
        log_line(command_id, 'log', f"Received command {command_id} ({kind})")
    except Exception:
        pass

    if kind == 'run_python':
        run_python(command_id, str(payload.get('code') or ''))
        return

    # Unsupported kinds in phase-1
    try:
        log_line(command_id, 'stderr', f"Unsupported command kind: {kind}")
    except Exception:
        pass
    post_json(f"/iot-lab/agent/commands/{command_id}/finish/", {
        'status': 'failed',
        'exit_code': 2,
        'stdout': '',
        'stderr': '',
        'error': f"Unsupported kind {kind}",
    })


def main():
    print(f"Atonix IoT Agent starting. API={API_BASE} device_id={DEVICE_ID}")

    next_hb = 0.0

    while True:
        now = time.time()
        if now >= next_hb:
            try:
                send_heartbeat()
            except Exception as e:
                print(f"heartbeat failed: {e}")
            next_hb = now + HEARTBEAT_SECONDS

        try:
            data = get_json('/iot-lab/agent/next-command/')
            cmd = data.get('command') if isinstance(data, dict) else None
            if cmd:
                handle_command(cmd)
        except Exception as e:
            print(f"poll failed: {e}")

        time.sleep(POLL_SECONDS)


if __name__ == '__main__':
    main()
