from datetime import datetime, timezone
import unittest

from fitbit_air_ingestion.normalize import to_raw_row


class NormalizeTests(unittest.TestCase):
    def test_normalizes_interval_event(self):
        point = {
            "name": "users/1/dataTypes/steps/dataPoints/abc",
            "data": {
                "steps": {
                    "interval": {
                        "startTime": "2026-07-10T12:00:00Z",
                        "endTime": "2026-07-10T12:15:00Z",
                    },
                    "count": "1240",
                }
            },
        }
        row = to_raw_row(
            "steps",
            point,
            "run-1",
            datetime(2026, 7, 11, tzinfo=timezone.utc),
        )
        self.assertTrue(row["event_id"].endswith("/abc"))
        self.assertEqual(row["event_date"], "2026-07-10")
        self.assertEqual(row["observed_start"], "2026-07-10T12:00:00+00:00")
        self.assertEqual(row["payload"]["data"]["steps"]["count"], "1240")

    def test_generates_stable_id_when_source_id_is_missing(self):
        point = {
            "data": {
                "dailyRestingHeartRate": {"date": "2026-07-10", "bpm": 58}
            }
        }
        first = to_raw_row(
            "daily-resting-heart-rate", point, "a", datetime.now(timezone.utc)
        )
        second = to_raw_row(
            "daily-resting-heart-rate", point, "b", datetime.now(timezone.utc)
        )
        self.assertEqual(first["event_id"], second["event_id"])
        self.assertEqual(first["event_date"], "2026-07-10")


if __name__ == "__main__":
    unittest.main()
