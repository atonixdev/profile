import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional

from django.conf import settings


@dataclass(frozen=True)
class LocalLogRecord:
    run_id: int
    level: str
    message: str
    extra: Dict[str, Any]


def _labs_root() -> Path:
    base_dir = Path(getattr(settings, 'BASE_DIR'))
    return base_dir / 'databases' / 'user_labs'


def get_user_lab_db_path(user_id: int) -> Path:
    root = _labs_root()
    root.mkdir(parents=True, exist_ok=True)
    return root / f'user_{user_id}.sqlite3'


def init_user_lab_db(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(str(db_path)) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS lab_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                run_id INTEGER NOT NULL,
                level TEXT NOT NULL,
                message TEXT NOT NULL,
                extra_json TEXT NOT NULL
            );
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_lab_logs_run_id ON lab_logs(run_id);")
        conn.commit()


def append_log(
    *,
    user_id: int,
    run_id: int,
    level: str,
    message: str,
    extra: Optional[Dict[str, Any]] = None,
) -> Path:
    db_path = get_user_lab_db_path(user_id)
    init_user_lab_db(db_path)

    payload = json.dumps(extra or {}, separators=(',', ':'), default=str)
    with sqlite3.connect(str(db_path)) as conn:
        conn.execute(
            "INSERT INTO lab_logs (run_id, level, message, extra_json) VALUES (?, ?, ?, ?)",
            (run_id, level, message, payload),
        )
        conn.commit()

    return db_path


def read_logs(*, user_id: int, run_id: int, limit: int = 200) -> list[LocalLogRecord]:
    db_path = get_user_lab_db_path(user_id)
    if not db_path.exists():
        return []

    with sqlite3.connect(str(db_path)) as conn:
        rows = conn.execute(
            "SELECT run_id, level, message, extra_json FROM lab_logs WHERE run_id = ? ORDER BY id DESC LIMIT ?",
            (run_id, limit),
        ).fetchall()

    records: list[LocalLogRecord] = []
    for run_id_value, level, message, extra_json in rows:
        try:
            extra = json.loads(extra_json) if extra_json else {}
        except Exception:
            extra = {}
        records.append(LocalLogRecord(run_id=run_id_value, level=level, message=message, extra=extra))
    return records
