from __future__ import annotations

from datetime import date, datetime, timezone
import hashlib
import json
from typing import Any


def to_raw_row(
    data_type: str,
    point: dict[str, Any],
    sync_run_id: str,
    fetched_at: datetime,
) -> dict[str, Any]:
    observed_start, observed_end, event_date = _extract_time(point)
    canonical = json.dumps(point, separators=(",", ":"), sort_keys=True)
    event_id = point.get("dataPointName") or point.get("name")
    if not event_id:
        event_id = hashlib.sha256(
            f"{data_type}:{canonical}".encode("utf-8")
        ).hexdigest()

    return {
        "event_id": event_id,
        "data_type": data_type,
        "event_date": event_date.isoformat(),
        "observed_start": _iso_or_none(observed_start),
        "observed_end": _iso_or_none(observed_end),
        "payload": point,
        "sync_run_id": sync_run_id,
        "fetched_at": fetched_at.astimezone(timezone.utc).isoformat(),
    }


def _extract_time(
    point: dict[str, Any],
) -> tuple[datetime | None, datetime | None, date]:
    data = point.get("data", point)
    candidate = next((value for value in data.values() if isinstance(value, dict)), data)
    interval = candidate.get("interval", {})
    sample = candidate.get("sampleTime", {})
    start = _parse_timestamp(
        interval.get("startTime")
        or interval.get("civilStartTime")
        or sample.get("time")
    )
    end = _parse_timestamp(interval.get("endTime") or interval.get("civilEndTime"))
    date_value = candidate.get("date")
    event_date = _parse_date(date_value) or (start or datetime.now(timezone.utc)).date()
    return start, end, event_date


def _parse_timestamp(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _parse_date(value: Any) -> date | None:
    if isinstance(value, str):
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
    if isinstance(value, dict) and {"year", "month", "day"} <= value.keys():
        return date(int(value["year"]), int(value["month"]), int(value["day"]))
    return None


def _iso_or_none(value: datetime | None) -> str | None:
    return value.astimezone(timezone.utc).isoformat() if value else None
