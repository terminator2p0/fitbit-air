from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    project_id: str
    dataset: str = "fitbit_air"
    location: str = "US"
    token_secret: str = "google-health-oauth"
    initial_lookback_days: int = 30

    @classmethod
    def from_environment(cls) -> "Settings":
        project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT is required")
        return cls(
            project_id=project_id,
            dataset=os.environ.get("BIGQUERY_DATASET", "fitbit_air"),
            location=os.environ.get("BIGQUERY_LOCATION", "US"),
            token_secret=os.environ.get(
                "GOOGLE_HEALTH_TOKEN_SECRET", "google-health-oauth"
            ),
            initial_lookback_days=int(os.environ.get("INITIAL_LOOKBACK_DAYS", "30")),
        )
