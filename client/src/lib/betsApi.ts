const EXTERNAL_API_BASE_URL = "https://sports-admin-server.jbets.online";
const USERNAME = "JorgeConquer";
const PASSWORD = "L4nho1q6CRB5WDn65Hf";

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

function readString(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return text === "undefined" || text === "null" ? "" : text;
}

function parseNumber(value: unknown): number | null {
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

function formatCurrency(value: unknown): string {
  const parsed = parseNumber(value);
  if (parsed === null) {
    const text = readString(value);
    return text || "-";
  }

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parsed);
}

function formatDate(value: unknown): string {
  const text = readString(value);
  if (!text) return "-";

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function firstValue(row: any, candidates: string[]): unknown {
  for (const key of candidates) {
    const value = row?.[key];
    if (value !== undefined && value !== null && readString(value)) {
      return value;
    }
  }

  return "";
}

function extractRows(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;

  const containers = [payload?.message, payload?.data, payload?.result, payload];
  const preferredKeys = ["docs", "tickets", "items", "rows", "results", "list", "data", "records"];

  for (const container of containers) {
    if (Array.isArray(container)) return container;

    for (const key of preferredKeys) {
      if (Array.isArray(container?.[key])) {
        return container[key];
      }
    }
  }

  return [];
}

async function getAuthToken(): Promise<string> {
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration) {
    return cachedToken;
  }

  const loginResponse = await fetch(`${EXTERNAL_API_BASE_URL}/v1/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: USERNAME,
      password: PASSWORD,
    }),
  });

  if (!loginResponse.ok) {
    throw new Error(`Authentication failed: ${loginResponse.status}`);
  }

  const loginData = await loginResponse.json();
  const token = loginData.message?.accessToken ?? loginData.accessToken ?? loginData.token;

  if (!token) {
    throw new Error("No se recibio token para consultar tickets");
  }

  cachedToken = token;
  tokenExpiration = Date.now() + 60 * 60 * 1000;
  return token;
}

export interface TicketFilters {
  userId: string;
  startDate?: string;
  endDate?: string;
  platformId?: string;
  status?: string;
  playerId?: string;
  ticketId?: string;
  gameId?: string;
  eventId?: string;
}

export interface TicketRow {
  idTicket: string;
  plataforma: string;
  fecha: string;
  securityCode: string;
  tipo: string;
  idJugador: string;
  estado: string;
  apuesta: string;
  gananciaPotencial: string;
  tracking: string;
  trackingEvents: Array<{
    fecha: string;
    evento: string;
    detalle: string;
  }>;
  acciones: string;
  detalles: string;
  detalleApuesta: {
    idJuego: string;
    evento: string;
    idEvento: string;
    fechaApuesta: string;
    estadoJuego: string;
    region: string;
    liga: string;
    deporte: string;
    juego: string;
    fechaJuego: string;
    seleccion: string;
    cuota: string;
    estado: string;
  };
}

export interface TicketRequestDebug {
  url: string;
  params: Record<string, string>;
  body: Record<string, string>;
  method: "POST";
}

function normalizeStatusForApi(status?: string): string {
  const normalized = readString(status).toLowerCase();
  const statusMap: Record<string, string> = {
    activo: "0",
    ganado: "1",
    perdido: "2",
    cancelado: "4",
    pendiente: "0",
    "pending- 0": "0",
    "won- 1": "1",
    "lost- 2": "2",
    "cashout- 3": "3",
    "cancelled- 4": "4",
  };

  return statusMap[normalized] ?? readString(status);
}

function normalizeTicketRow(
  row: any,
  platformNamesById: Record<string, string>,
): TicketRow {
  const platformId = readString(firstValue(row?.betData, ["platformId", "platform_id"]));
  const firstBet = Array.isArray(row?.betData?.params?.bets) ? row.betData.params.bets[0] : undefined;

  const platformName = readString(
    firstValue(row, ["platformName", "platform_name", "group", "brandName", "siteName"]),
  ) || platformNamesById[platformId] || platformNamesById[platformId.toLowerCase()] || "-";

  const currency = readString(firstValue(row?.betData?.params?.mainData, ["currency"]));
  const betAmount = firstValue(row?.betData?.params?.mainData, ["betAmount"]);
  const potentialWin = firstValue(row?.betData?.params?.mainData, ["totalWinAfterVat", "totalWin"]);
  const amountPrefix = currency ? `${currency} ` : "";

  const statusMap: Record<string, string> = {
    "0": "Pending- 0",
    "1": "Won- 1",
    "2": "Lost- 2",
    "3": "Cashout- 3",
    "4": "Cancelled- 4",
  };

  const trackingSummary = Array.isArray(row?.tracking) && row.tracking.length > 0
    ? readString(row.tracking[row.tracking.length - 1]?.action) || `${row.tracking.length} eventos`
    : "-";

  const trackingEvents = Array.isArray(row?.tracking)
    ? row.tracking.map((entry: any) => {
      const detailValue = firstValue(entry, ["response", "detail", "payload", "data", "body", "message"]);
      const detailText = typeof detailValue === "string"
        ? detailValue
        : detailValue !== undefined && detailValue !== null
          ? JSON.stringify(detailValue, null, 2)
          : "-";

      return {
        fecha: readString(firstValue(entry, ["date", "createdAt", "timestamp", "time", "at"])) || "-",
        evento: readString(firstValue(entry, ["action", "event", "title", "name"])) || "Evento",
        detalle: detailText,
      };
    })
    : [];

  const ticketStatus = statusMap[readString(firstValue(row, ["status", "estado", "ticketStatus", "betStatus"]))]
    || readString(firstValue(row, ["status", "estado", "ticketStatus", "betStatus"]))
    || "-";

  const detailSummary = readString(firstValue(firstBet?.extraData, ["itemDetails"]))
    || readString(firstValue(firstBet, ["selection", "marketName"]))
    || "-";

  const gameNameFromTeams = [
    readString(firstValue(firstBet, ["team1", "homeTeam", "home", "localTeam"])),
    readString(firstValue(firstBet, ["team2", "awayTeam", "away", "visitorTeam"])),
  ]
    .filter(Boolean)
    .join(" vs ");

  const gameName = gameNameFromTeams
    || readString(firstValue(firstBet, ["gameName", "matchName", "match", "name"]))
    || "-";

  const betDetail = {
    idJuego: readString(firstValue(firstBet, ["gameId", "idGame", "game_id", "matchId"])) || "-",
    evento: readString(firstValue(firstBet, ["eventName", "marketName", "itemDetails", "event"])) || detailSummary,
    idEvento: readString(firstValue(firstBet, ["eventId", "idEvent", "event_id"])) || "-",
    fechaApuesta: formatDate(firstValue(row, ["date", "createdAt", "created_at", "ticketDate", "updatedAt"])),
    estadoJuego: readString(firstValue(firstBet, ["gameStatus", "matchStatus", "status", "score"])) || "-",
    region: readString(firstValue(firstBet, ["region", "country", "location", "zone"])) || "-",
    liga: readString(firstValue(firstBet, ["league", "leagueName", "competition", "tournament"])) || "-",
    deporte: readString(firstValue(firstBet, ["sport", "sportName", "gameType", "discipline"])) || "-",
    juego: gameName,
    fechaJuego: formatDate(firstValue(firstBet, ["gameDate", "matchDate", "eventDate", "startTime", "date"])),
    seleccion: readString(firstValue(firstBet, ["selection", "pick", "marketSelection"])) || "-",
    cuota: readString(firstValue(firstBet, ["odds", "odd", "price", "cuota"])) || "-",
    estado: ticketStatus,
  };

  return {
    idTicket: readString(firstValue(row, ["ticketId", "ticket_id", "idTicket", "_id", "id"])) || "-",
    plataforma: platformName,
    fecha: formatDate(firstValue(row, ["date", "createdAt", "created_at", "fecha", "ticketDate", "updatedAt"])),
    securityCode: readString(firstValue(row, ["securityCode", "security_code", "code", "pin"])) || "-",
    tipo: readString(firstValue(row?.betData, ["typeName"])) || "-",
    idJugador: readString(firstValue(row, ["playerId", "player_id", "userId", "user_id"])) || "-",
    estado: ticketStatus,
    apuesta: `${amountPrefix}${formatCurrency(betAmount)}`,
    gananciaPotencial: `${amountPrefix}${formatCurrency(potentialWin)}`,
    tracking: trackingSummary,
    trackingEvents,
    acciones: readString(firstValue(row, ["actions", "acciones"])) || "-",
    detalles: detailSummary,
    detalleApuesta: betDetail,
  };
}

export async function fetchTickets(
  filters: TicketFilters,
  platformNamesById: Record<string, string> = {},
): Promise<TicketRow[]> {
  const request = buildTicketsRequest(filters);
  const token = await getAuthToken();

  const response = await fetch(request.url, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request.body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload?.message ?? "Error fetching tickets";
    throw new Error(message);
  }

  return extractRows(payload).map((row) => normalizeTicketRow(row, platformNamesById));
}

export function buildTicketsRequest(filters: TicketFilters): TicketRequestDebug {
  const normalizedStatus = normalizeStatusForApi(filters.status);
  const body: Record<string, string> = {
    userId: filters.userId,
  };

  if (filters.startDate) {
    body.startDate = filters.startDate;
  }

  if (filters.endDate) {
    body.endDate = filters.endDate;
  }

  if (filters.platformId) {
    body.platformId = filters.platformId;
    body.group = filters.platformId;
  }

  if (normalizedStatus) {
    body.status = normalizedStatus;
    body.estado = normalizedStatus;
  }

  if (filters.playerId) {
    body.playerId = filters.playerId;
    body.idJugador = filters.playerId;
  }

  if (filters.ticketId) {
    body.ticketId = filters.ticketId;
    body.idTicket = filters.ticketId;
  }

  if (filters.gameId) {
    body.gameId = filters.gameId;
    body.idJuego = filters.gameId;
  }

  if (filters.eventId) {
    body.eventId = filters.eventId;
    body.idEvento = filters.eventId;
  }

  return {
    url: `${EXTERNAL_API_BASE_URL}/v1/ticket/get_tickets`,
    params: body,
    body,
    method: "POST",
  };
}
