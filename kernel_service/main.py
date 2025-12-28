from __future__ import annotations

import os
import tempfile
import time
import uuid
from pathlib import Path
import subprocess

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="notebook-kernel", version="0.1.0")


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except Exception:
        return default


KERNEL_TIMEOUT_SECONDS = _env_int("KERNEL_TIMEOUT_SECONDS", 15)
KERNEL_MAX_OUTPUT_CHARS = _env_int("KERNEL_MAX_OUTPUT_CHARS", 20000)


class RunRequest(BaseModel):
    code: str = Field(default="", description="Python source to execute")


class InstallRequest(BaseModel):
    package: str = Field(min_length=1, max_length=200)


def _truncate(s: str) -> str:
    if s is None:
        return ""
    if len(s) <= KERNEL_MAX_OUTPUT_CHARS:
        return s
    return s[:KERNEL_MAX_OUTPUT_CHARS] + f"\n\n... (truncated to {KERNEL_MAX_OUTPUT_CHARS} chars)"


@app.get("/notebook/status")
def status():
    return {
        "status": "ok",
        "service": "notebook-kernel",
        "python": os.getenv("PYTHON_VERSION", "python3"),
        "timeout_seconds": KERNEL_TIMEOUT_SECONDS,
        "max_output_chars": KERNEL_MAX_OUTPUT_CHARS,
    }


@app.post("/notebook/run")
def run_code(payload: RunRequest):
    code = payload.code or ""

    # Create an isolated temp directory for the run
    run_id = str(uuid.uuid4())
    run_dir = Path(tempfile.gettempdir()) / f"nb_{run_id}"
    run_dir.mkdir(parents=True, exist_ok=True)
    file_path = run_dir / "cell.py"
    file_path.write_text(code, encoding="utf-8")

    start = time.time()
    try:
        completed = subprocess.run(
            ["python3", "-u", str(file_path)],
            cwd=str(run_dir),
            capture_output=True,
            text=True,
            timeout=KERNEL_TIMEOUT_SECONDS,
        )
        duration_ms = int((time.time() - start) * 1000)
        return {
            "stdout": _truncate(completed.stdout or ""),
            "stderr": _truncate(completed.stderr or ""),
            "exit_code": int(completed.returncode),
            "duration_ms": duration_ms,
        }
    except subprocess.TimeoutExpired as exc:
        duration_ms = int((time.time() - start) * 1000)
        return {
            "stdout": _truncate((exc.stdout or "") if hasattr(exc, "stdout") else ""),
            "stderr": _truncate("Execution timed out"),
            "exit_code": 124,
            "duration_ms": duration_ms,
        }


@app.post("/notebook/install")
def install_package(payload: InstallRequest):
    package = payload.package.strip()

    # IMPORTANT: In an MVP this installs into the container environment.
    # In production you'd likely want a whitelist and stronger isolation.
    start = time.time()
    completed = subprocess.run(
        ["pip", "install", package],
        capture_output=True,
        text=True,
    )
    duration_ms = int((time.time() - start) * 1000)

    return {
        "stdout": _truncate(completed.stdout or ""),
        "stderr": _truncate(completed.stderr or ""),
        "exit_code": int(completed.returncode),
        "duration_ms": duration_ms,
    }
