from __future__ import annotations

from datetime import datetime, timedelta, timezone
import logging
import uuid

from .auth import read_oauth_credentials, refresh_access_token
from .bigquery_sink import BigQuerySink
from .config import Settings
from .health_client import GoogleHealthClient
from .normalize import to_raw_row


DATA_TYPES = (
    "steps",
    "distance",
    "active-energy-burned",
    "total-calories",
    "floors",
    "active-zone-minutes",
    "exercise",
    "heart-rate",
    "daily-resting-heart-rate",
    "daily-heart-rate-variability",
    "heart-rate-variability",
    "daily-heart-rate-zones",
    "sleep",
    "daily-oxygen-saturation",
    "daily-respiratory-rate",
    "daily-sleep-temperature-derivations",
    "weight",
    "body-fat",
    "daily-vo2-max",
    "hydration-log",
    "nutrition-log",
)


def run_sync(now: datetime | None = None) -> dict[str, int]:
    from google.cloud import bigquery, secretmanager

    settings = Settings.from_environment()
    secret_client = secretmanager.SecretManagerServiceClient()
    credentials = read_oauth_credentials(settings, secret_client)
    access_token = refresh_access_token(credentials)
    health = GoogleHealthClient(access_token)
    sink = BigQuerySink(
        settings,
        bigquery.Client(project=settings.project_id, location=settings.location),
    )
    sink.ensure_schema()

    end = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    run_id = str(uuid.uuid4())
    results: dict[str, int] = {}
    for data_type in DATA_TYPES:
        checkpoint = sink.get_checkpoint(data_type)
        start = checkpoint or end - timedelta(days=settings.initial_lookback_days)
        fetched_at = datetime.now(timezone.utc)
        rows = (
            to_raw_row(data_type, point, run_id, fetched_at)
            for point in health.iter_reconciled(data_type, start, end)
        )
        count = sink.load_raw_rows(rows)
        sink.update_checkpoint(data_type, end, count)
        results[data_type] = count
        logging.info("Synced %s rows for %s", count, data_type)
    return results


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    results = run_sync()
    logging.info("Sync complete: %s rows", sum(results.values()))


if __name__ == "__main__":
    main()
