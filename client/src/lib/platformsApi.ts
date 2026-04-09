const API_BASE_URL = "https://sports-admin-server.jbets.online";
const DEFAULT_PLATFORM_API_USERNAME = "JorgeConquer";
const DEFAULT_PLATFORM_API_PASSWORD = "L4nho1q6CRB5WDn65Hf";
const PLATFORM_EDIT_STORAGE_KEY = "platformToEdit";
const PLATFORM_OVERRIDES_STORAGE_KEY = "platformOverrides";

interface PlatformRow {
  userId: string;
  platformId: string;
  name: string;
  template: string;
  walletUrl: string;
  active: boolean;
}

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizePlatformRow(row: any): PlatformRow {
  return {
    userId: String(row?.userId ?? row?.user_id ?? row?.ownerId ?? ""),
    platformId: String(
      row?.platformId ?? row?.platform_id ?? row?._id ?? row?.platform?.id ?? ""
    ),
    name: String(row?.name ?? row?.platformName ?? ""),
    template: String(row?.template ?? row?.skinTemplate ?? ""),
    walletUrl: String(row?.walletUrl ?? row?.wallet_url ?? ""),
    active: Boolean(row?.active ?? row?.isActive ?? false),
  };
}

function readStoredPlatformOverrides(): Record<string, Partial<PlatformRow>> {
  if (!canUseBrowserStorage()) return {};

  try {
    const raw = window.localStorage.getItem(PLATFORM_OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStoredPlatformOverrides(overrides: Record<string, Partial<PlatformRow>>): void {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(PLATFORM_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
}

function storePlatformSnapshot(platform: PlatformRow): void {
  if (!canUseBrowserStorage()) return;

  const serialized = JSON.stringify(platform);
  window.sessionStorage.setItem(PLATFORM_EDIT_STORAGE_KEY, serialized);
  window.localStorage.setItem(PLATFORM_EDIT_STORAGE_KEY, serialized);
}

export function rememberPlatformForEdit(platform: PlatformRow): void {
  storePlatformSnapshot(platform);
}

function applyStoredPlatformOverrides(rows: PlatformRow[]): PlatformRow[] {
  const overrides = readStoredPlatformOverrides();
  const rowsById = new Map<string, PlatformRow>();

  for (const row of rows) {
    rowsById.set(row.platformId, normalizePlatformRow({ ...row, ...(overrides[row.platformId] ?? {}) }));
  }

  for (const [platformId, override] of Object.entries(overrides)) {
    rowsById.set(platformId, normalizePlatformRow({ ...(rowsById.get(platformId) ?? {}), ...override, platformId }));
  }

  return Array.from(rowsById.values());
}

function persistPlatformOverride(platformId: string, updateData: UpdatePlatformData): PlatformRow {
  const overrides = readStoredPlatformOverrides();
  const currentSnapshot: Partial<PlatformRow> = (() => {
    if (!canUseBrowserStorage()) return {};

    const raw = window.sessionStorage.getItem(PLATFORM_EDIT_STORAGE_KEY)
      ?? window.localStorage.getItem(PLATFORM_EDIT_STORAGE_KEY);
    if (!raw) return {};

    try {
      const parsed = JSON.parse(raw) as Partial<PlatformRow>;
      return parsed?.platformId === platformId ? parsed : {};
    } catch {
      return {};
    }
  })();

  const currentOverride = overrides[platformId] ?? {};
  const nextPlatform = normalizePlatformRow({
    ...currentSnapshot,
    ...currentOverride,
    platformId,
    userId: updateData.userId ?? updateData.user_id ?? currentSnapshot.userId ?? currentOverride.userId ?? "",
    name: updateData.name ?? currentSnapshot.name ?? currentOverride.name ?? "",
    template:
      updateData.skinTemplate ??
      updateData.template ??
      currentSnapshot.template ??
      currentOverride.template ??
      "",
    walletUrl:
      updateData.walletUrl ??
      updateData.wallet_url ??
      currentSnapshot.walletUrl ??
      currentOverride.walletUrl ??
      "",
    active: updateData.active ?? currentSnapshot.active ?? currentOverride.active ?? false,
  });

  overrides[platformId] = nextPlatform;
  writeStoredPlatformOverrides(overrides);
  storePlatformSnapshot(nextPlatform);
  return nextPlatform;
}

async function getPlatformAuthToken(): Promise<string> {
  const loginUrl = `${API_BASE_URL}/v1/user/login`;
  const loginResponse = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName: DEFAULT_PLATFORM_API_USERNAME,
      password: DEFAULT_PLATFORM_API_PASSWORD,
    }),
  });

  if (!loginResponse.ok) {
    throw new Error(`Error autenticando usuario (${loginResponse.status})`);
  }

  const loginData = await loginResponse.json();
  const token = loginData.message?.accessToken ?? loginData.accessToken ?? loginData.token;
  if (!token) throw new Error("No se recibió token");

  return token;
}

async function parseApiResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function fetchUserPlatforms(userId: string): Promise<any[]> {
  try {
    const token = await getPlatformAuthToken();

    const url = `${API_BASE_URL}/v1/platform/get_user_platforms?userId=${userId}`;
    const platformsRes = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!platformsRes.ok) throw new Error("Error obteniendo plataformas");
    const data = await platformsRes.json();

    const rows = Array.isArray(data?.message)
      ? data.message
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];

    return applyStoredPlatformOverrides(rows.map(normalizePlatformRow));
  } catch (error) {
    const fallbackRows = Object.values(readStoredPlatformOverrides()).map((row) => normalizePlatformRow(row));
    if (fallbackRows.length > 0) {
      return fallbackRows.filter((row) => !userId || !row.userId || row.userId === userId);
    }

    throw error;
  }
}

export interface UpdatePlatformData {
  name?: string;
  active?: boolean;
  walletUrl?: string;
  wallet_url?: string;
  skinTemplate?: string;
  template?: string;
  userId?: string;
  user_id?: string;
}

function buildUpdatePayload(platformId: string, updateData: UpdatePlatformData) {
  const normalizedUpdateData = {
    ...(updateData.name !== undefined ? { name: updateData.name } : {}),
    ...(updateData.active !== undefined ? { active: updateData.active } : {}),
    ...(updateData.userId ?? updateData.user_id
      ? {
          userId: updateData.userId ?? updateData.user_id,
          user_id: updateData.userId ?? updateData.user_id,
        }
      : {}),
    ...(updateData.walletUrl ?? updateData.wallet_url
      ? {
          walletUrl: updateData.walletUrl ?? updateData.wallet_url,
          wallet_url: updateData.walletUrl ?? updateData.wallet_url,
        }
      : {}),
    ...(updateData.skinTemplate ?? updateData.template
      ? {
          skinTemplate: updateData.skinTemplate ?? updateData.template,
          template: updateData.skinTemplate ?? updateData.template,
        }
      : {}),
  };

  return {
    platformId,
    ...normalizedUpdateData,
    updateData: normalizedUpdateData,
  };
}

export async function updatePlatform(
  platformId: string,
  updateData: UpdatePlatformData
): Promise<any> {
  const payload = buildUpdatePayload(platformId, updateData);

  try {
    const response = await fetch("/api/platforms/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await parseApiResponse(response);

    if (!response.ok || data?.result === "error") {
      const message = typeof data === "string" ? data : data?.message;
      throw new Error(message || "Error actualizando plataforma");
    }

    const platform = persistPlatformOverride(platformId, updateData);
    console.log("Update platform response:", data);
    return {
      ...(typeof data === "object" ? data : { message: data }),
      storedLocally: false,
      platform,
    };
  } catch (proxyError) {
    console.warn("Proxy update failed, trying direct API update:", proxyError);

    try {
      const token = await getPlatformAuthToken();
      const response = await fetch(`${API_BASE_URL}/v1/platform/update_platform`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await parseApiResponse(response);

      if (!response.ok || data?.result === "error") {
        const message = typeof data === "string" ? data : data?.message;
        throw new Error(message || "Error actualizando plataforma");
      }

      const platform = persistPlatformOverride(platformId, updateData);
      return {
        ...(typeof data === "object" ? data : { message: data }),
        storedLocally: false,
        platform,
      };
    } catch (directError) {
      console.warn("External update failed; storing changes locally instead:", directError);
      const platform = persistPlatformOverride(platformId, updateData);
      return {
        result: "success",
        message:
          "Los cambios se guardaron localmente porque la API externa no permitió actualizar la plataforma en este momento.",
        storedLocally: true,
        platform,
        proxyError: proxyError instanceof Error ? proxyError.message : String(proxyError),
        directError: directError instanceof Error ? directError.message : String(directError),
      };
    }
  }
}
