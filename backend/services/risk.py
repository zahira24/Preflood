from pathlib import Path

from ml.risk_engine import evaluate_risk
from ml.weather_processor import load_latest_weather


def sync_risk_alert(db, risk):
    if db is None or not isinstance(risk, dict):
        return
    level = risk.get("level")
    if level in ("HIGH", "CRITICAL"):
        existing = db.execute(
            "SELECT 1 FROM alerts WHERE active = 1 AND severity IN ('HIGH', 'CRITICAL')"
        ).fetchone()
        if not existing:
            from backend.database.db import utc_now
            score = risk.get("score", 0)
            title = f"Automated Risk Alert: {level} Risk Level"
            message = f"Weather sensors indicate a {level} flood risk level (Risk Index: {score}). Please review evacuation plans and shelter availability."
            db.execute(
                "INSERT INTO alerts (title, message, severity, area, active, created_at) VALUES (?, ?, ?, ?, 1, ?)",
                (title, message, level, "Monitored Region", utc_now()),
            )
            db.commit()


def current_risk(root, db=None):
    weather = load_latest_weather(Path(root) / "data" / "weatherdata.csv")
    risk = evaluate_risk(weather or {})
    if db is not None:
        sync_risk_alert(db, risk)
    return risk
