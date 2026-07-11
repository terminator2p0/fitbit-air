from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any, Protocol
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .config import Settings


TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"


class SecretReader(Protocol):
    def access_secret_version(self, request: dict[str, str]) -> Any: ...


@dataclass(frozen=True)
class OAuthCredentials:
    client_id: str
    client_secret: str
    refresh_token: str


def read_oauth_credentials(settings: Settings, client: SecretReader) -> OAuthCredentials:
    name = (
        f"projects/{settings.project_id}/secrets/{settings.token_secret}/versions/latest"
    )
    response = client.access_secret_version(request={"name": name})
    payload = json.loads(response.payload.data.decode("utf-8"))
    return OAuthCredentials(
        client_id=payload["clientId"],
        client_secret=payload["clientSecret"],
        refresh_token=payload["refreshToken"],
    )


def refresh_access_token(
    credentials: OAuthCredentials,
    opener=urlopen,
) -> str:
    body = urlencode(
        {
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "refresh_token": credentials.refresh_token,
            "grant_type": "refresh_token",
        }
    ).encode("utf-8")
    request = Request(
        TOKEN_ENDPOINT,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with opener(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload["access_token"]
