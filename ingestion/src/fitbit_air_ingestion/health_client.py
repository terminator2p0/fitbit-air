from __future__ import annotations

from collections.abc import Callable, Iterator
from datetime import datetime, timezone
import json
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen


API_ROOT = "https://health.googleapis.com/v4"
DAILY_DATA_TYPES = {
    "daily-heart-rate-variability",
    "daily-heart-rate-zones",
    "daily-oxygen-saturation",
    "daily-respiratory-rate",
    "daily-resting-heart-rate",
    "daily-sleep-temperature-derivations",
    "daily-vo2-max",
}
SAMPLE_DATA_TYPES = {
    "body-fat",
    "heart-rate",
    "heart-rate-variability",
    "oxygen-saturation",
    "respiratory-rate-sleep-summary",
    "run-vo2-max",
    "vo2-max",
    "weight",
}


class GoogleHealthClient:
    def __init__(
        self,
        access_token: str,
        opener: Callable[..., Any] = urlopen,
    ) -> None:
        self._access_token = access_token
        self._opener = opener

    def iter_reconciled(
        self,
        data_type: str,
        start: datetime,
        end: datetime,
        page_size: int = 1000,
    ) -> Iterator[dict[str, Any]]:
        if start.tzinfo is None or end.tzinfo is None:
            raise ValueError("start and end must be timezone-aware")
        page_token: str | None = None
        filter_name = data_type.replace("-", "_")
        time_filter = _build_time_filter(data_type, filter_name, start, end)

        while True:
            query = {
                "pageSize": str(page_size),
                "dataSourceFamily": "users/me/dataSourceFamilies/all-sources",
                "filter": time_filter,
            }
            if page_token:
                query["pageToken"] = page_token
            url = (
                f"{API_ROOT}/users/me/dataTypes/{data_type}/dataPoints:reconcile?"
                f"{urlencode(query)}"
            )
            request = Request(
                url,
                headers={
                    "Authorization": f"Bearer {self._access_token}",
                    "Accept": "application/json",
                },
            )
            with self._opener(request, timeout=60) as response:
                payload = json.loads(response.read().decode("utf-8"))
            yield from payload.get("dataPoints", [])
            page_token = payload.get("nextPageToken") or None
            if not page_token:
                break


def _rfc3339(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _build_time_filter(
    data_type: str,
    filter_name: str,
    start: datetime,
    end: datetime,
) -> str:
    if data_type in DAILY_DATA_TYPES:
        return (
            f'{filter_name}.date >= "{start.date().isoformat()}" '
            f'AND {filter_name}.date < "{end.date().isoformat()}"'
        )
    path = "sample_time.time" if data_type in SAMPLE_DATA_TYPES else "interval.start_time"
    return (
        f'{filter_name}.{path} >= "{_rfc3339(start)}" '
        f'AND {filter_name}.{path} < "{_rfc3339(end)}"'
    )
