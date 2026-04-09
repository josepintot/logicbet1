let cachedToken: string | null = null;
let tokenExpirationTime: number | null = null;
let cookies: string[] = [];

const API_BASE_URL = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
const FALLBACK_EXTERNAL_API_USERNAME = "JorgeConquer";
const FALLBACK_EXTERNAL_API_PASSWORD = "L4nho1q6CRB5WDn65Hf";

const browserHeaders = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

async function requestAuthToken(username: string, password: string): Promise<string> {
  console.log("Fetching new auth token...");
  console.log("Username:", username);

  const headers: Record<string, string> = {
    ...browserHeaders,
    "Content-Type": "application/json",
    "Origin": API_BASE_URL,
    "Referer": `${API_BASE_URL}/`,
  };

  const response = await fetch(`${API_BASE_URL}/v1/user/login`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      userName: username,
      password,
    }),
  });

  console.log("Response status:", response.status);

  const setCookieHeader = typeof (response.headers as any).getSetCookie === "function"
    ? (response.headers as any).getSetCookie()
    : response.headers.get("set-cookie");

  if (setCookieHeader) {
    const rawCookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    cookies = rawCookies.map((cookie) => cookie.split(";")[0]).filter(Boolean);
    console.log("Captured cookies:", cookies.length);
  }

  if (!response.ok) {
    const error = await response.text();
    console.error("Login failed:", response.status);
    console.error("Error body (first 500 chars):", error.substring(0, 500));
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("Login response:", data);

  if (data.error) {
    throw new Error(`API Error: ${data.error}`);
  }

  const token = data.message?.accessToken || data.message?.token || data.accessToken || data.token;

  if (!token) {
    throw new Error(`No token in response: ${JSON.stringify(data)}`);
  }

  cachedToken = token;

  try {
    if (cachedToken) {
      const parts = cachedToken.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload.exp) {
          tokenExpirationTime = payload.exp * 1000;
          console.log("Token expires at:", new Date(tokenExpirationTime).toISOString());
        }
      }
    }
  } catch (e) {
    console.warn("Could not parse token expiration:", e);
    tokenExpirationTime = Date.now() + 3600000;
  }

  return cachedToken as string;
}

export async function getAuthToken(): Promise<string> {
  if (cachedToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    console.log("Using cached auth token");
    return cachedToken;
  }

  const credentialCandidates = [
    {
      username: process.env.EXTERNAL_API_USERNAME,
      password: process.env.EXTERNAL_API_PASSWORD,
      label: "environment",
    },
    {
      username: FALLBACK_EXTERNAL_API_USERNAME,
      password: FALLBACK_EXTERNAL_API_PASSWORD,
      label: "fallback",
    },
  ].filter(
    (candidate, index, array) =>
      candidate.username &&
      candidate.password &&
      array.findIndex(
        (item) => item.username === candidate.username && item.password === candidate.password,
      ) === index,
  );

  if (!credentialCandidates.length) {
    throw new Error(
      "Missing EXTERNAL_API_USERNAME or EXTERNAL_API_PASSWORD in environment variables"
    );
  }

  let lastError: unknown;

  for (const candidate of credentialCandidates) {
    try {
      console.log(`Trying ${candidate.label} credentials...`);
      return await requestAuthToken(candidate.username as string, candidate.password as string);
    } catch (error) {
      lastError = error;
      clearAuthToken();
      console.warn(`Auth attempt failed using ${candidate.label} credentials`, error);
    }
  }

  console.error("Token fetch error:", lastError);
  throw lastError instanceof Error ? lastError : new Error("Authentication failed");
}

export function getRequestHeaders(token: string): Record<string, string> {
  const headers: Record<string, string> = {
    ...browserHeaders,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  if (cookies.length > 0) {
    headers["Cookie"] = cookies.join("; ");
  }

  return headers;
}

export function clearAuthToken(): void {
  cachedToken = null;
  tokenExpirationTime = null;
  cookies = [];
  console.log("Auth token and cookies cleared");
}
