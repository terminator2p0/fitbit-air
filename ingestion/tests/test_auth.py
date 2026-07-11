import json
import unittest

from fitbit_air_ingestion.auth import read_oauth_credentials, refresh_access_token
from fitbit_air_ingestion.config import Settings


class Payload:
    def __init__(self, data):
        self.data = data


class SecretResponse:
    def __init__(self, value):
        self.payload = Payload(json.dumps(value).encode("utf-8"))


class FakeSecretClient:
    def __init__(self, value):
        self.value = value
        self.request = None

    def access_secret_version(self, request):
        self.request = request
        return SecretResponse(self.value)


class TokenResponse:
    def __enter__(self):
        return self

    def __exit__(self, *_):
        return None

    def read(self):
        return b'{"access_token":"fresh-access-token"}'


class AuthTests(unittest.TestCase):
    def test_reads_web_callback_secret_contract(self):
        client = FakeSecretClient(
            {
                "clientId": "client-id",
                "clientSecret": "client-secret",
                "refreshToken": "refresh-token",
            }
        )
        settings = Settings(project_id="project", token_secret="oauth-secret")
        credentials = read_oauth_credentials(settings, client)

        self.assertEqual(credentials.client_id, "client-id")
        self.assertEqual(credentials.client_secret, "client-secret")
        self.assertEqual(credentials.refresh_token, "refresh-token")
        self.assertEqual(
            client.request["name"],
            "projects/project/secrets/oauth-secret/versions/latest",
        )

    def test_refreshes_access_token(self):
        captured = []

        def opener(request, timeout):
            captured.append((request, timeout))
            return TokenResponse()

        credentials = type(
            "Credentials",
            (),
            {
                "client_id": "client-id",
                "client_secret": "client-secret",
                "refresh_token": "refresh-token",
            },
        )()
        token = refresh_access_token(credentials, opener=opener)

        self.assertEqual(token, "fresh-access-token")
        self.assertEqual(captured[0][1], 30)
        self.assertIn(b"grant_type=refresh_token", captured[0][0].data)


if __name__ == "__main__":
    unittest.main()
