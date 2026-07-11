from __future__ import annotations

from collections.abc import Iterable
from datetime import datetime
from typing import Any
from uuid import uuid4

from .config import Settings


RAW_TABLE = "raw_health_events"
SYNC_TABLE = "sync_state"


class BigQuerySink:
    def __init__(self, settings: Settings, client: Any) -> None:
        self.settings = settings
        self.client = client
        self.dataset_id = f"{settings.project_id}.{settings.dataset}"

    def ensure_schema(self) -> None:
        from google.cloud import bigquery

        dataset = bigquery.Dataset(self.dataset_id)
        dataset.location = self.settings.location
        self.client.create_dataset(dataset, exists_ok=True)

        raw_table = bigquery.Table(
            f"{self.dataset_id}.{RAW_TABLE}",
            schema=[
                bigquery.SchemaField("event_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("data_type", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("event_date", "DATE", mode="REQUIRED"),
                bigquery.SchemaField("observed_start", "TIMESTAMP"),
                bigquery.SchemaField("observed_end", "TIMESTAMP"),
                bigquery.SchemaField("payload", "JSON", mode="REQUIRED"),
                bigquery.SchemaField("sync_run_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("fetched_at", "TIMESTAMP", mode="REQUIRED"),
            ],
        )
        raw_table.time_partitioning = bigquery.TimePartitioning(field="event_date")
        raw_table.clustering_fields = ["data_type", "event_id"]
        self.client.create_table(raw_table, exists_ok=True)

        sync_table = bigquery.Table(
            f"{self.dataset_id}.{SYNC_TABLE}",
            schema=[
                bigquery.SchemaField("data_type", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("last_successful_end", "TIMESTAMP", mode="REQUIRED"),
                bigquery.SchemaField("updated_at", "TIMESTAMP", mode="REQUIRED"),
                bigquery.SchemaField("last_row_count", "INTEGER", mode="REQUIRED"),
            ],
        )
        self.client.create_table(sync_table, exists_ok=True)

    def load_raw_rows(self, rows: Iterable[dict[str, Any]]) -> int:
        materialized = list({row["event_id"]: row for row in rows}.values())
        if not materialized:
            return 0
        from google.cloud import bigquery

        target = f"{self.dataset_id}.{RAW_TABLE}"
        staging = f"{self.dataset_id}._staging_raw_{uuid4().hex}"
        schema = self.client.get_table(target).schema
        config = bigquery.LoadJobConfig(
            schema=schema,
            write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
        )
        try:
            self.client.load_table_from_json(
                materialized,
                staging,
                job_config=config,
                location=self.settings.location,
            ).result()
            merge_sql = f"""
                MERGE `{target}` target
                USING `{staging}` source
                ON target.event_id = source.event_id
                WHEN MATCHED THEN UPDATE SET
                  data_type = source.data_type,
                  event_date = source.event_date,
                  observed_start = source.observed_start,
                  observed_end = source.observed_end,
                  payload = source.payload,
                  sync_run_id = source.sync_run_id,
                  fetched_at = source.fetched_at
                WHEN NOT MATCHED THEN INSERT
                  (event_id, data_type, event_date, observed_start, observed_end,
                   payload, sync_run_id, fetched_at)
                VALUES
                  (source.event_id, source.data_type, source.event_date,
                   source.observed_start, source.observed_end, source.payload,
                   source.sync_run_id, source.fetched_at)
            """
            self.client.query(
                merge_sql,
                location=self.settings.location,
            ).result()
        finally:
            self.client.delete_table(staging, not_found_ok=True)
        return len(materialized)

    def get_checkpoint(self, data_type: str) -> datetime | None:
        from google.cloud import bigquery

        sql = f"""
            SELECT last_successful_end
            FROM `{self.dataset_id}.{SYNC_TABLE}`
            WHERE data_type = @data_type
            LIMIT 1
        """
        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("data_type", "STRING", data_type)
            ]
        )
        rows = list(self.client.query(sql, job_config=config, location=self.settings.location))
        return rows[0].last_successful_end if rows else None

    def update_checkpoint(self, data_type: str, end: datetime, row_count: int) -> None:
        from google.cloud import bigquery

        sql = f"""
            MERGE `{self.dataset_id}.{SYNC_TABLE}` target
            USING (
              SELECT @data_type AS data_type, @end AS last_successful_end,
                     CURRENT_TIMESTAMP() AS updated_at, @row_count AS last_row_count
            ) source
            ON target.data_type = source.data_type
            WHEN MATCHED THEN UPDATE SET
              last_successful_end = source.last_successful_end,
              updated_at = source.updated_at,
              last_row_count = source.last_row_count
            WHEN NOT MATCHED THEN INSERT
              (data_type, last_successful_end, updated_at, last_row_count)
              VALUES
              (source.data_type, source.last_successful_end, source.updated_at, source.last_row_count)
        """
        config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("data_type", "STRING", data_type),
                bigquery.ScalarQueryParameter("end", "TIMESTAMP", end),
                bigquery.ScalarQueryParameter("row_count", "INT64", row_count),
            ]
        )
        self.client.query(sql, job_config=config, location=self.settings.location).result()
