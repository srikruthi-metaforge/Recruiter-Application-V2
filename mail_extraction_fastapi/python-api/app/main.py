from __future__ import annotations

import logging
import secrets
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .config import resolve_mail_runtime, settings
from .mail_runner import MailSyncRequest, run_mail_sync

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
_LOG = logging.getLogger("python_api")

app = FastAPI(
    title="MetaForge Python API",
    description="Gateway for mail extraction. Runs the existing sync_to_backend.py pipeline unchanged.",
    version="1.0.0",
)


class MailSyncBody(BaseModel):
    mode: Literal["sync", "historical"] = "sync"
    limit: int = Field(default=25, ge=1, le=500)
    days: int = Field(default=2, ge=1, le=30)
    timezone: str = "Asia/Kolkata"
    force: bool = False


def require_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> None:
    expected = settings.api_key
    if not expected:
        # Dev-friendly: auth optional until PYTHON_API_KEY is set on both sides.
        return
    if not x_api_key or not secrets.compare_digest(x_api_key, expected):
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


@app.get("/")
def root():
    """Browser-friendly entry (GET / is not a sync endpoint)."""
    return {
        "service": "metaforge-python-api",
        "status": "ok",
        "docs": "/docs",
        "health": "/health",
        "mail_sync": "POST /v1/mail/sync",
        "note": "Nest calls /v1/mail/sync; open /health or /docs in the browser.",
    }


@app.get("/health")
def health():
    runtime = resolve_mail_runtime()
    return {
        "status": "ok",
        "service": "metaforge-python-api",
        "mail_pipeline": "ready" if runtime else "missing",
        "mail_dir": str(runtime[0]) if runtime else None,
        "metaforge_api_url": settings.metaforge_api_url,
    }


@app.post("/v1/mail/sync")
def mail_sync(body: MailSyncBody, _: None = Depends(require_api_key)):
    """
    Run the existing Outlook → Nest ingest pipeline.
    Nest should call this instead of spawning Python locally.
    """
    _LOG.info(
        "mail/sync requested mode=%s limit=%s days=%s force=%s",
        body.mode,
        body.limit,
        body.days,
        body.force,
    )
    result = run_mail_sync(
        MailSyncRequest(
            mode=body.mode,
            limit=body.limit,
            days=body.days,
            timezone=body.timezone,
            force=body.force,
        )
    )
    # Always 200 with ok flag so Nest can apply the same completion handling as spawn.
    return {
        "ok": result.ok,
        "exitCode": result.exit_code,
        "timedOut": result.timed_out,
        "result": result.result,
        "message": result.message,
        "args": result.args,
        "cwd": result.cwd,
        # Tails only — same size discipline Nest used for spawn stdout/stderr.
        "stdoutTail": result.stdout_tail,
        "stderrTail": result.stderr_tail,
    }
