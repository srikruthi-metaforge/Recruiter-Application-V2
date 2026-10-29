from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# python-api/app/config.py → python-api → mail_extraction_fastapi → repo root
ROOT = Path(__file__).resolve().parents[1]
BUNDLE_ROOT = ROOT.parent
REPO_ROOT = BUNDLE_ROOT.parent
load_dotenv(ROOT / ".env")


def _env(name: str, default: str = "") -> str:
    return str(os.environ.get(name, default) or "").strip()


class Settings:
    port: int = int(_env("PORT", "8000") or "8000")
    api_key: str = _env("PYTHON_API_KEY")
    mail_extraction_dir: str = _env("MAIL_EXTRACTION_DIR")
    mail_extraction_python: str = _env("MAIL_EXTRACTION_PYTHON")
    metaforge_api_url: str = _env("METAFORGE_API_URL", "http://127.0.0.1:3001")
    metaforge_requirements_endpoint: str = _env(
        "METAFORGE_REQUIREMENTS_ENDPOINT",
        "api/v1/requirements/ingest-email",
    )
    metaforge_api_key: str = _env("METAFORGE_API_KEY")
    timeout_minutes: int = max(1, int(_env("MAIL_EXTRACTION_TIMEOUT_MINUTES", "20") or "20"))


settings = Settings()


def resolve_mail_runtime() -> tuple[Path, Path, Path] | None:
    """
    Locate scripts/sync_to_backend.py and a Python interpreter.
    Prefers sibling Mail extraction under mail_extraction_fastapi/.
    """
    candidates = [
        settings.mail_extraction_dir or None,
        str(BUNDLE_ROOT / "Mail extraction" / "devloper" / "devloper"),
        str(BUNDLE_ROOT / "Mail extraction" / "Auto_email_extraction"),
        str(REPO_ROOT / "mail_extraction_fastapi" / "Mail extraction" / "devloper" / "devloper"),
        str(REPO_ROOT / "mail_extraction_fastapi" / "Mail extraction" / "Auto_email_extraction"),
        # Legacy layout (pre-move) — harmless if missing
        str(REPO_ROOT / "Mail extraction" / "devloper" / "devloper"),
        str(REPO_ROOT / "Mail extraction" / "Auto_email_extraction"),
    ]
    for raw in candidates:
        if not raw:
            continue
        dir_path = Path(raw)
        script = dir_path / "scripts" / "sync_to_backend.py"
        if not script.is_file():
            continue
        python_candidates = [
            settings.mail_extraction_python or None,
            str(dir_path / ".venv" / "Scripts" / "python.exe"),
            str(dir_path / ".venv" / "bin" / "python"),
        ]
        for py in python_candidates:
            if py and Path(py).is_file():
                return dir_path, Path(py), script
    return None
