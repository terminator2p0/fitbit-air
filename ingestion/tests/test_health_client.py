from datetime import datetime, timezone
import json
import unittest
from urllib.parse import parse_qs, urlparse

from fitbit_air_ingestion.health_client import GoogleHealthClient


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return None

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class GoogleHealthClientTests(unittest.TestCase):
    def test_reconciled_pagination_and_authorization(self):
        requests = []
        pages = [
            {"dataPoints": [{"name": "one"}], "nextPageToken": "next"},
            {"dataPoints": [{"name": "two"}]},
        ]

        def opener(request, timeout):
            requests.append((request, timeout))
            return FakeResponse(pages.pop(0))

        client = GoogleHealthClient("access-token", opener=opener)
        points = list(
            client.iter_reconciled(
                "steps",
                datetime(2026, 7, 1, tzinfo=timezone.utc),
                datetime(2026, 7, 2, tzinfo=timezone.utc),
            )
        )

        self.assertEqual([point["name"] for point in points], ["one", "two"])
        self.assertEqual(
            requests[0][0].get_header("Authorization"), "Bearer access-token"
        )
        self.assertEqual(
            parse_qs(urlparse(requests[1][0].full_url).query)["pageToken"],
            ["next"],
        )

    def test_daily_metrics_use_date_filters(self):
        captured = []

        def opener(request, timeout):
            captured.append(request)
            return FakeResponse({"dataPoints": []})

        client = GoogleHealthClient("token", opener=opener)
        list(
            client.iter_reconciled(
                "daily-resting-heart-rate",
                datetime(2026, 7, 1, tzinfo=timezone.utc),
                datetime(2026, 7, 3, tzinfo=timezone.utc),
            )
        )
        filter_value = parse_qs(urlparse(captured[0].full_url).query)["filter"][0]
        self.assertIn("daily_resting_heart_rate.date", filter_value)
        self.assertIn("2026-07-01", filter_value)

    def test_requires_timezone_aware_boundaries(self):
        client = GoogleHealthClient("token", opener=lambda *_args, **_kwargs: None)
        with self.assertRaisesRegex(ValueError, "timezone-aware"):
            list(
                client.iter_reconciled(
                    "steps",
                    datetime(2026, 7, 1),
                    datetime(2026, 7, 2),
                )
            )


if __name__ == "__main__":
    unittest.main()
