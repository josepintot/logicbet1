const API_BASE_URL = "https://sports-admin-server.jbets.online";
const EXTERNAL_API_BASE_URL = "https://sports-admin-server.jbets.online";
const USERNAME = "JorgeConquer";
const PASSWORD = "L4nho1q6CRB5WDn65Hf";

// Cache para el token de autenticación
let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

async function getAuthToken(): Promise<string> {
  // Si tenemos un token válido en caché, usarlo
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
    console.log("✅ Using cached token");
    return cachedToken;
  }

  try {
    // Obtener nuevo token
    console.log("🔑 Requesting new auth token...");
    const loginRes = await fetch(`${EXTERNAL_API_BASE_URL}/v1/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: USERNAME, password: PASSWORD }),
    });
    
    console.log("🔑 Login response status:", loginRes.status);
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    console.log("🔑 Login response:", loginData);
    
    // Check for error in response
    if (loginData.error) {
      throw new Error(`API Error: ${loginData.error}`);
    }
    
    const token = loginData.message?.accessToken || loginData.accessToken || loginData.token;
    
    if (!token) {
      throw new Error("No token in response: " + JSON.stringify(loginData));
    }

    cachedToken = token;
    // Expira en 1 hora
    tokenExpiration = Date.now() + (60 * 60 * 1000);
    console.log("✅ New token cached successfully");
    
    return token;
  } catch (error) {
    console.error("❌ Auth token error:", error);
    throw error;
  }
}

export interface PlayerSearchParams {
  filter: 'group' | 'id' | 'name' | 'email' | 'username' | 'userName' | 'playerId' | 'userId';
  page: number;
  text: string;
}

export interface PlayerSearchResponse {
  message: {
    players: any[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface PlayerProfileParams {
  playerId: string;
  playerToken: string;
  userId: string;
  platformId: string;
}

export interface PlayerRiskProfileParams {
  playerId: string;
  platformId: string;
}

export interface TopPlayersParams {
  userId: string;
  startDate: string;
  endDate: string;
  currency?: string;
}

export async function searchPlayers(params: PlayerSearchParams): Promise<PlayerSearchResponse> {
  // Search players directly from the browser (Cloudflare allows browser requests)
  const token = await getAuthToken();

  const queryParams = new URLSearchParams({
    filter: params.filter,
    page: params.page.toString(),
    text: params.text,
  });

  const url = `${EXTERNAL_API_BASE_URL}/v1/player/search_players?${queryParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Error fetching players");
  }

  const data = await response.json();
  console.log("Search players response:", data);
  return data;
}

const PROFILE_FIELD_LABELS: Record<keyof PlayerProfileParams, string> = {
  playerId: "ID del jugador",
  playerToken: "token del jugador",
  userId: "ID del usuario",
  platformId: "ID de la plataforma",
};

function readString(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return text === "undefined" || text === "null" ? "" : text;
}

function extractPlayersFromPayload(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  const preferredKeys = ["players", "items", "rows", "results", "list", "data", "records"];
  for (const key of preferredKeys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  const firstArray = Object.values(payload).find((value) => Array.isArray(value));
  return Array.isArray(firstArray) ? firstArray : [];
}

function getProfileParamsFromRow(row: any, fallbackUserId = ""): PlayerProfileParams {
  const playerId = readString(
    row?.playerId ?? row?.player_id ?? row?.id ?? row?._id ?? row?.player?.playerId ?? row?.player?.id
  );

  return {
    playerId,
    playerToken: readString(
      row?.playerToken ??
      row?.player_token ??
      row?.token ??
      row?.player?.playerToken ??
      row?.player?.player_token ??
      row?.player?.token ??
      row?.authToken ??
      row?.sessionToken ??
      row?.jwtToken ??
      playerId
    ),
    userId: readString(
      row?.userId ??
      row?.user_id ??
      row?.ownerId ??
      row?.owner_id ??
      row?.player?.userId ??
      row?.player?.user_id ??
      fallbackUserId
    ),
    platformId: readString(
      row?.platformId ??
      row?.platform_id ??
      row?.platform?.platformId ??
      row?.platform?.id ??
      row?.platform?._id ??
      row?.brandId ??
      row?.brand_id
    ),
  };
}

export function getMissingPlayerProfileFields(
  params: PlayerProfileParams,
): Array<keyof PlayerProfileParams> {
  return (Object.entries(params) as Array<[keyof PlayerProfileParams, string]>)
    .filter(([, value]) => !readString(value))
    .map(([key]) => key);
}

export function formatMissingPlayerProfileFields(
  fields: Array<keyof PlayerProfileParams>,
): string {
  return fields.map((field) => PROFILE_FIELD_LABELS[field]).join(", ");
}

export function getPlayerPlatformName(
  row: any,
  platformNamesById: Record<string, string> = {},
): string {
  const platformValue = row?.platform;

  const platformIdCandidates = [
    row?.platformId,
    row?.platform_id,
    platformValue?.platformId,
    platformValue?.id,
    platformValue?._id,
    row?.brandId,
    row?.brand_id,
  ]
    .map(readString)
    .filter(Boolean);

  for (const platformId of platformIdCandidates) {
    const mappedName =
      platformNamesById[platformId] ?? platformNamesById[platformId.toLowerCase()];

    if (mappedName) {
      return mappedName;
    }
  }

  const candidates = [
    row?.platformName,
    row?.platform_name,
    platformValue?.name,
    platformValue?.platformName,
    typeof platformValue === "string" ? platformValue : "",
    row?.groupName,
    row?.group,
    row?.brandName,
    row?.brand?.name,
    typeof row?.brand === "string" ? row?.brand : "",
    row?.siteName,
    row?.site?.name,
  ];

  const match = candidates.map(readString).find(Boolean);
  return match || "-";
}

export function getTopPlayerCurrency(row: any, fallback = ""): string {
  const candidates = [
    row?.currency,
    row?.currencyCode,
    row?.currency_code,
    row?.coin,
    row?.coinCode,
    row?.moneda,
    row?.divisa,
    row?.walletCurrency,
    row?.wallet?.currency,
    row?.amountCurrency,
  ];

  const match = candidates.map(readString).find(Boolean);
  return (match || fallback).toUpperCase();
}

function parseNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;

  const sanitized = value.replace(/[^\d,.-]/g, "").trim();
  if (!sanitized) return null;

  const hasComma = sanitized.includes(",");
  const hasDot = sanitized.includes(".");

  let normalized = sanitized;
  if (hasComma && hasDot) {
    normalized = sanitized.lastIndexOf(",") > sanitized.lastIndexOf(".")
      ? sanitized.replace(/\./g, "").replace(",", ".")
      : sanitized.replace(/,/g, "");
  } else if (hasComma) {
    normalized = sanitized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function findMetricValueForCurrency(row: any, metric: "bets" | "wins", currency: string): number | null {
  const upperCurrency = readString(currency).toUpperCase();
  const metricKeys = metric === "bets"
    ? ["apostado", "totalBet", "totalBets", "betAmount", "amountBet", "amount"]
    : ["ganado", "totalWin", "totalWinnings", "winAmount", "amountWin", "profit", "prize"];

  const nestedCurrencySources = [
    row?.amountsByCurrency,
    row?.totalsByCurrency,
    row?.valuesByCurrency,
    row?.amounts,
    row?.totals,
    row?.currencies,
    row?.[metric === "bets" ? "betsByCurrency" : "winsByCurrency"],
    row?.[metric === "bets" ? "betByCurrency" : "winByCurrency"],
  ];

  for (const source of nestedCurrencySources) {
    if (!source || typeof source !== "object") continue;

    const directValue = source?.[upperCurrency] ?? source?.[upperCurrency.toLowerCase()];
    const parsedDirectValue = parseNumericValue(directValue);
    if (parsedDirectValue !== null) return parsedDirectValue;
  }

  const currencyKeyCandidates = metricKeys.flatMap((key) => [
    `${key}${upperCurrency}`,
    `${key}_${upperCurrency}`,
    `${key}_${upperCurrency.toLowerCase()}`,
    `${key}${upperCurrency.toLowerCase()}`,
  ]);

  for (const key of currencyKeyCandidates) {
    const parsedValue = parseNumericValue(row?.[key]);
    if (parsedValue !== null) return parsedValue;
  }

  for (const key of metricKeys) {
    const metricObject = row?.[key];
    if (!metricObject || typeof metricObject !== "object") continue;

    const directValue = metricObject?.[upperCurrency] ?? metricObject?.[upperCurrency.toLowerCase()];
    const parsedDirectValue = parseNumericValue(directValue);
    if (parsedDirectValue !== null) return parsedDirectValue;
  }

  const baseValue = metricKeys
    .map((key) => parseNumericValue(row?.[key]))
    .find((value) => value !== null);

  return baseValue ?? null;
}

export function getTopPlayerMetricAmount(
  row: any,
  metric: "bets" | "wins",
  currency: string,
): number | null {
  return findMetricValueForCurrency(row, metric, currency);
}

export function formatPlayerAmountByCurrency(
  value: number | null | undefined,
  currency: string,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(value);
}

function pickBestPlayerMatch(players: any[], row: any): any | null {
  if (!players.length) return null;

  const rowId = readString(row?.playerId ?? row?.player_id ?? row?.id ?? row?._id);
  const rowEmail = readString(row?.email).toLowerCase();
  const rowName = readString(row?.name ?? row?.playerName ?? row?.username ?? row?.userName).toLowerCase();
  const rowPlatformName = readString(getPlayerPlatformName(row)).toLowerCase();

  if (rowId) {
    const exactIdMatch = players.find((candidate) => {
      const candidateId = readString(
        candidate?.playerId ?? candidate?.player_id ?? candidate?.id ?? candidate?._id,
      );
      return candidateId === rowId;
    });

    if (exactIdMatch) return exactIdMatch;
  }

  if (rowEmail) {
    const exactEmailMatch = players.find(
      (candidate) => readString(candidate?.email).toLowerCase() === rowEmail,
    );

    if (exactEmailMatch) return exactEmailMatch;
  }

  if (rowName) {
    const exactNameMatch = players.find((candidate) => {
      const candidateName = readString(
        candidate?.name ?? candidate?.playerName ?? candidate?.username ?? candidate?.userName,
      ).toLowerCase();
      const candidatePlatform = readString(
        candidate?.platformName ?? candidate?.platform?.name,
      ).toLowerCase();

      if (candidateName !== rowName) return false;
      return !rowPlatformName || !candidatePlatform || candidatePlatform === rowPlatformName;
    });

    if (exactNameMatch) return exactNameMatch;
  }

  return players[0] ?? null;
}

export async function resolvePlayerProfileParams(
  row: any,
  fallbackUserId = "",
): Promise<PlayerProfileParams> {
  let params = getProfileParamsFromRow(row, fallbackUserId);

  if (getMissingPlayerProfileFields(params).length === 0) {
    return params;
  }

  const searchAttempts = [
    { filter: "id" as const, text: readString(row?.playerId ?? row?.player_id ?? row?.id) },
    { filter: "email" as const, text: readString(row?.email) },
    { filter: "username" as const, text: readString(row?.username ?? row?.userName) },
    { filter: "name" as const, text: readString(row?.name ?? row?.playerName ?? row?.username ?? row?.userName) },
  ].filter(
    (attempt, index, array) =>
      attempt.text &&
      array.findIndex(
        (candidate) => candidate.filter === attempt.filter && candidate.text === attempt.text,
      ) === index,
  );

  for (const attempt of searchAttempts) {
    try {
      const response = await searchPlayers({
        filter: attempt.filter,
        page: 1,
        text: attempt.text,
      });

      const fromMessage = extractPlayersFromPayload(response?.message);
      const fromData = extractPlayersFromPayload((response as any)?.data);
      const players = fromMessage.length
        ? fromMessage
        : fromData.length
          ? fromData
          : extractPlayersFromPayload(response);

      const match = pickBestPlayerMatch(players, row);
      if (!match) continue;

      params = getProfileParamsFromRow({ ...row, ...match }, fallbackUserId);
      if (getMissingPlayerProfileFields(params).length === 0) {
        return params;
      }
    } catch (error) {
      console.warn("Could not enrich player profile params from search", attempt, error);
    }
  }

  return params;
}

export async function getPlayerProfile(params: PlayerProfileParams): Promise<any> {
  const token = await getAuthToken();
  const queryParams = new URLSearchParams({
    playerId: params.playerId,
    playerToken: params.playerToken,
    userId: params.userId,
    platformId: params.platformId,
  });

  const response = await fetch(`${EXTERNAL_API_BASE_URL}/v1/player/get_player_profile?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!response.ok) {
    let message = bodyText || "Error fetching player profile";

    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(bodyText);
        message = parsed?.message || parsed?.error || message;
      } catch {
        // Keep the raw body text if JSON parsing fails.
      }
    }

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Unexpected content type from player profile endpoint: ${contentType || "unknown"}`);
  }

  return JSON.parse(bodyText);
}

export async function getPlayerRiskProfile(params: PlayerRiskProfileParams): Promise<any> {
  const token = await getAuthToken();
  const queryParams = new URLSearchParams({
    playerId: params.playerId,
    platformId: params.platformId,
  });

  const response = await fetch(`${EXTERNAL_API_BASE_URL}/v1/risk/get_player_risk_profile?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!response.ok) {
    let message = bodyText || "Error fetching player risk profile";

    if (contentType.includes("application/json")) {
      try {
        const parsed = JSON.parse(bodyText);
        message = parsed?.message || parsed?.error || message;
      } catch {
        // Keep the raw body text if JSON parsing fails.
      }
    }

    throw new Error(message);
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Unexpected content type from player risk profile endpoint: ${contentType || "unknown"}`);
  }

  return JSON.parse(bodyText);
}

export async function getTopPlayersByBets(params: TopPlayersParams): Promise<any> {
  const token = await getAuthToken();

  const queryParams = new URLSearchParams({
    userId: params.userId,
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.currency ? { currency: params.currency } : {}),
  });

  const url = `${EXTERNAL_API_BASE_URL}/v1/report/get_top_players_by_bets?${queryParams}`;
  console.log("🔍 Fetching top players by bets from:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("✅ Response status:", response.status);
  const data = await response.json();
  console.log("📊 Response data:", data);

  if (!response.ok) {
    throw new Error(data?.message || "Error fetching top players by bets");
  }

  return data;
}

export async function getTopPlayersByWins(params: TopPlayersParams): Promise<any> {
  const token = await getAuthToken();

  const queryParams = new URLSearchParams({
    userId: params.userId,
    startDate: params.startDate,
    endDate: params.endDate,
    ...(params.currency ? { currency: params.currency } : {}),
  });

  const url = `${EXTERNAL_API_BASE_URL}/v1/report/get_top_players_by_wins?${queryParams}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Error fetching top players by wins");
  }

  return response.json();
}

export async function getActivePlayersReport(params: TopPlayersParams): Promise<any> {
  const token = await getAuthToken();

  const rawUrl = `${EXTERNAL_API_BASE_URL}/v1/report/get_active_players?userId=${params.userId}&startDate=${params.startDate}&endDate=${params.endDate}`;
  const url = encodeURI(rawUrl);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Error fetching active players");
  }

  return response.json();
}

function extractPlayersTotal(payload: any): number {
  const message = payload?.message ?? payload?.data ?? payload;
  const totalCandidates = [
    message?.total,
    message?.totalPlayers,
    message?.count,
    message?.pagination?.total,
    message?.pagination?.totalItems,
  ];

  for (const candidate of totalCandidates) {
    if (typeof candidate === "number") return candidate;
  }

  const players = message?.players ?? message?.items ?? message?.data ?? [];
  if (Array.isArray(players)) return players.length;

  return 0;
}

// Get active players count
export async function getActivePlayers(): Promise<number> {
  try {
      console.log("Fetching active players...");
      // Try searching with a wildcard or common pattern
      // You may need to adjust this based on your actual data
    const result = await searchPlayers({
        filter: 'id',
      page: 1,
        text: '0', // Try searching for any player ID containing 0
    });
    
      console.log("Active players result:", result);
    const total = extractPlayersTotal(result);
    console.log("Total players:", total);

    return total;
  } catch (error) {
    console.error("Error fetching active players:", error);
      return 0; // Return 0 instead of throwing to prevent UI errors
  }
}
