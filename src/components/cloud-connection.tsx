"use client";

import { CircleAlert, CircleCheck, Cloud, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

type ConnectionStatus = {
  configured: boolean;
  bigQuery: "ready" | "unavailable";
  dataset: string;
  projectId: string;
  missing: string[];
  googleHealth: { connected: boolean; connectedAt?: string | null; scopes?: number };
};

export function CloudConnection() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health/status", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Status request failed");
        return response.json() as Promise<ConnectionStatus>;
      })
      .then(setStatus)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);

  if (failed) {
    return <div className="connection-banner warning"><CircleAlert size={18} /><div><strong>Backend status unavailable</strong><span>Check the local server and Google Cloud configuration.</span></div></div>;
  }

  if (!status) {
    return <div className="connection-banner"><LoaderCircle className="spin" size={18} /><div><strong>Checking Google Cloud</strong><span>Verifying BigQuery, Secret Manager, and Google Health.</span></div></div>;
  }

  const connected = status.bigQuery === "ready" && status.googleHealth.connected;
  return (
    <div className={`connection-banner ${connected ? "connected" : "warning"}`}>
      {connected ? <CircleCheck size={18} /> : <Cloud size={18} />}
      <div>
        <strong>{connected ? "Google Health connected" : "Complete Google Cloud connection"}</strong>
        <span>
          BigQuery {status.bigQuery === "ready" ? "ready" : "not reachable"}
          {status.projectId ? ` · ${status.projectId}.${status.dataset}` : ""}
        </span>
      </div>
      {!status.googleHealth.connected && (
        <a className={`button ${status.configured ? "primary" : "secondary"}`} href={status.configured ? "/api/auth/google-health/start" : "#cloud-setup"}>
          {status.configured ? "Connect Google Health" : "Configuration required"}
        </a>
      )}
    </div>
  );
}
