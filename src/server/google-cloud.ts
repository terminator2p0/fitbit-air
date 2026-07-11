import { BigQuery } from "@google-cloud/bigquery";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { getServerConfig } from "./config";

let bigQuery: BigQuery | undefined;
let secretManager: SecretManagerServiceClient | undefined;

export function getBigQueryClient() {
  const config = getServerConfig();
  if (!config.googleCloudProject) throw new Error("GOOGLE_CLOUD_PROJECT is required");
  bigQuery ??= new BigQuery({
    projectId: config.googleCloudProject,
  });
  return bigQuery;
}

export function getSecretManagerClient() {
  secretManager ??= new SecretManagerServiceClient();
  return secretManager;
}

export async function checkBigQueryConnection() {
  const config = getServerConfig();
  const [exists] = await getBigQueryClient().dataset(config.bigQueryDataset).exists();
  return exists;
}

export function getGoogleHealthSecretName() {
  const config = getServerConfig();
  if (!config.googleCloudProject) throw new Error("GOOGLE_CLOUD_PROJECT is required");
  return `projects/${config.googleCloudProject}/secrets/${config.googleHealthTokenSecret}`;
}

export async function storeGoogleHealthSecret(payload: object) {
  const secretName = getGoogleHealthSecretName();
  await getSecretManagerClient().addSecretVersion({
    parent: secretName,
    payload: { data: Buffer.from(JSON.stringify(payload), "utf8") },
  });
}

export async function googleHealthSecretExists() {
  try {
    const [version] = await getSecretManagerClient().accessSecretVersion({
      name: `${getGoogleHealthSecretName()}/versions/latest`,
    });
    return Boolean(version.payload?.data);
  } catch {
    return false;
  }
}
