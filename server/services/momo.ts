/**
 * MTN Mobile Money (MoMo) Collections API integration
 * Docs: https://momodeveloper.mtn.com/api-documentation/collection/
 */

interface MoMoConfig {
  apiKey: string;
  apiSecret: string;
  subscriptionKey: string;
  environment: "sandbox" | "production";
  callbackUrl: string;
}

function getConfig(): MoMoConfig {
  const apiKey = process.env.MOMO_API_KEY;
  const apiSecret = process.env.MOMO_API_SECRET;
  const subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
  if (!apiKey || !apiSecret || !subscriptionKey) {
    throw new Error("MTN MoMo credentials are not configured (MOMO_API_KEY, MOMO_API_SECRET, MOMO_SUBSCRIPTION_KEY)");
  }
  return {
    apiKey,
    apiSecret,
    subscriptionKey,
    environment: (process.env.MOMO_ENVIRONMENT as "sandbox" | "production") || "sandbox",
    callbackUrl: process.env.MOMO_CALLBACK_URL || "",
  };
}

export function isMoMoConfigured(): boolean {
  return !!(process.env.MOMO_API_KEY && process.env.MOMO_API_SECRET && process.env.MOMO_SUBSCRIPTION_KEY);
}

function getBaseUrl(env: string): string {
  return env === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";
}

/**
 * Get an OAuth2 access token from the MoMo API
 */
async function getAccessToken(config: MoMoConfig): Promise<string> {
  const baseUrl = getBaseUrl(config.environment);
  const credentials = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");

  const res = await fetch(`${baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MoMo token request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Initiate a request-to-pay (collection) via MoMo
 */
export async function requestToPay(opts: {
  amount: number;
  currency: string;
  phoneNumber: string;
  externalId: string;
  payerMessage: string;
  referenceId: string;
}): Promise<{ referenceId: string }> {
  const config = getConfig();
  const baseUrl = getBaseUrl(config.environment);
  const token = await getAccessToken(config);

  // Currency mapping: FCFA -> EUR for sandbox, XAF for production
  const momoCurrency =
    config.environment === "sandbox"
      ? "EUR"
      : opts.currency.toUpperCase() === "FCFA"
        ? "XAF"
        : opts.currency.toUpperCase();

  const res = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": opts.referenceId,
      "X-Target-Environment": config.environment,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/json",
      ...(config.callbackUrl ? { "X-Callback-Url": config.callbackUrl } : {}),
    },
    body: JSON.stringify({
      amount: opts.amount.toString(),
      currency: momoCurrency,
      externalId: opts.externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: opts.phoneNumber.replace(/[^0-9]/g, ""),
      },
      payerMessage: opts.payerMessage,
      payeeNote: `VOOM payment ${opts.externalId}`,
    }),
  });

  if (!res.ok && res.status !== 202) {
    const text = await res.text();
    throw new Error(`MoMo request-to-pay failed (${res.status}): ${text}`);
  }

  return { referenceId: opts.referenceId };
}

/**
 * Check the status of a request-to-pay transaction
 */
export async function getTransactionStatus(referenceId: string): Promise<{
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  reason?: string;
}> {
  const config = getConfig();
  const baseUrl = getBaseUrl(config.environment);
  const token = await getAccessToken(config);

  const res = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": config.environment,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MoMo status check failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { status: string; reason?: { code: string; message: string } };
  return {
    status: data.status as "PENDING" | "SUCCESSFUL" | "FAILED",
    reason: data.reason?.message,
  };
}
