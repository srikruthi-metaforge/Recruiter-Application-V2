from __future__ import annotations

import json
import logging
import os
import re
import subprocess
from dataclasses import dataclass
from typing import Any

from .config import resolve_mail_runtime, settings

_LOG = logging.getLogger("python_api.mail_runner")
_RESULT_RE = re.compile(r"SYNC_RESULT_JSON:(.+)")


@dataclass
class MailSyncRequest:
    mode: str = "sync"  # sync | historical
    limit: int = 25
    days: int = 2
    timezone: str = "Asia/Kolkata"
    force: bool = False


@dataclass
class MailSyncResult:
    ok: bool
    exit_code: int
    timed_out: bool
    result: dict[str, Any] | None
    stdout_tail: str
    stderr_tail: str
    message: str
    args: list[str]
    cwd: str


def build_cli_args(req: MailSyncRequest) -> list[str]:
    """Build the same CLI args Nest previously passed to sync_to_backend.py."""
    if req.mode == "historical":
        args = [
            "--mode",
            "historical",
            "--days",
            str(max(1, int(req.days))),
            "--timezone",
            req.timezone or "Asia/Kolkata",
            "--limit",
            str(max(1, int(req.limit))),
        ]
        if req.force:
            args.append("--force")
        return args
    return ["--limit", str(max(1, int(req.limit)))]


def run_mail_sync(req: MailSyncRequest) -> MailSyncResult:
    """
    Run the existing sync_to_backend.py via subprocess.
    Extraction / ingest logic is unchanged — this only relocates who launches it.
    """
    runtime = resolve_mail_runtime()
    if not runtime:
        return MailSyncResult(
            ok=False,
            exit_code=-1,
            timed_out=False,
            result=None,
            stdout_tail="",
            stderr_tail="",
            message=(
                "Mail extraction pipeline not found. Set MAIL_EXTRACTION_DIR to the folder "
                "containing scripts/sync_to_backend.py and its .venv"
            ),
            args=[],
            cwd="",
        )

    dir_path, python_exe, script_path = runtime
    cli_args = build_cli_args(req)
    cmd = [str(python_exe), str(script_path), *cli_args]

    env = os.environ.copy()
    env["METAFORGE_MODE"] = "api"
    env["METAFORGE_API_URL"] = settings.metaforge_api_url
    env["METAFORGE_REQUIREMENTS_ENDPOINT"] = settings.metaforge_requirements_endpoint
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUNBUFFERED"] = "1"
    if settings.metaforge_api_key:
        env["METAFORGE_API_KEY"] = settings.metaforge_api_key

    timeout_sec = settings.timeout_minutes * 60
    _LOG.info("Running mail sync: %s (cwd=%s timeout=%ss)", " ".join(cmd), dir_path, timeout_sec)

    timed_out = False
    try:
        completed = subprocess.run(
            cmd,
            cwd=str(dir_path),
            env=env,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_sec,
        )
        stdout = completed.stdout or ""
        stderr = completed.stderr or ""
        code = int(completed.returncode)
    except subprocess.TimeoutExpired as exc:
        timed_out = True
        stdout = (exc.stdout or "") if isinstance(exc.stdout, str) else ""
        stderr = (exc.stderr or "") if isinstance(exc.stderr, str) else ""
        code = -1
    except Exception as exc:  # noqa: BLE001 — surface any launch failure to Nest
        return MailSyncResult(
            ok=False,
            exit_code=-1,
            timed_out=False,
            result=None,
            stdout_tail="",
            stderr_tail=str(exc),
            message=f"Failed to start mail extraction: {exc}",
            args=cli_args,
            cwd=str(dir_path),
        )

    parsed: dict[str, Any] | None = None
    match = _RESULT_RE.search(stdout)
    if match:
        try:
            parsed = json.loads(match.group(1))
        except json.JSONDecodeError:
            parsed = None

    max_tail = 64 * 1024
    stdout_tail = stdout[-max_tail:]
    stderr_tail = stderr[-max_tail:]

    if timed_out:
        message = f"Timed out after {settings.timeout_minutes} minute(s)"
        ok = False
    elif code == 0:
        message = "Mail extraction completed"
        ok = True
    else:
        tail = (stderr_tail or stdout_tail).strip().splitlines()[-15:]
        message = "\n".join(tail) or f"Process exited with code {code}"
        ok = False

    return MailSyncResult(
        ok=ok,
        exit_code=code,
        timed_out=timed_out,
        result=parsed,
        stdout_tail=stdout_tail,
        stderr_tail=stderr_tail,
        message=message,
        args=cli_args,
        cwd=str(dir_path),
    )
