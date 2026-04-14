import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./localAuth";
import { getAuthToken, getRequestHeaders } from "./externalApiAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (no-op - using external API)
  await setupAuth(app);
  
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/api/login", (req, res) => {
    const { userName, password } = req.body ?? {};

    if (!userName || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    return res.json({
      message: {
        accessToken: "local-dev-token",
        user: {
          userName,
        },
      },
    });
  });

  // Proxy endpoint for financial report
  app.get("/api/financial-report", async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;

      if (!userId || !startDate || !endDate) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameters: userId, startDate, endDate",
        });
      }

      const params = new URLSearchParams({
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/report/get_monthly_report_stats?${params.toString()}`;

      console.log("=== Proxying Financial Report Request ===");
      console.log("URL:", externalApiUrl);

      // Get auth token
      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      console.log("Headers being sent with Authorization and browser info");

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);
      console.log("Response content-type:", response.headers.get("content-type"));

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        // If not JSON, get text to debug
        const text = await response.text();
        console.error("Non-JSON response received:", text.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: text.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      console.log("External API success - returning data");
      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for player search
  app.get("/api/players/search", async (req, res) => {
    try {
      const rawFilter = (req.query.filter || req.query.searchOption || req.query.type) as string | undefined;
      const rawText = (req.query.text || req.query.query || req.query.search) as string | undefined;
      const pageValue = (req.query.page || "1") as string;

      const filterMap: Record<string, string> = {
        nombre: "name",
        name: "name",
        id: "id",
        plataforma: "group",
        group: "group",
        email: "email",
      };

      const filterValue = rawFilter ? filterMap[rawFilter] || rawFilter : undefined;
      const textValue = rawText?.toString().trim();

      if (!filterValue || !textValue) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameters: filter and text (page is optional)",
        });
      }

      const params = new URLSearchParams({
        filter: filterValue,
        page: pageValue.toString(),
        text: textValue,
      });

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/player/search_players?${params.toString()}`;

      console.log("=== Proxying Player Search Request ===");
      console.log("URL:", externalApiUrl);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for player profile
  app.get("/api/players/profile", async (req, res) => {
    try {
      const { playerId, playerToken, userId, platformId } = req.query;

      if (!playerId || !playerToken || !userId || !platformId) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameters: playerId, playerToken, userId, platformId",
        });
      }

      const params = new URLSearchParams({
        playerId: playerId as string,
        playerToken: playerToken as string,
        userId: userId as string,
        platformId: platformId as string,
      });

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/player/get_player_profile?${params.toString()}`;

      console.log("=== Proxying Player Profile Request ===");
      console.log("URL:", externalApiUrl);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for player risk profile
  app.get("/api/players/risk-profile", async (req, res) => {
    try {
      const { playerId, platformId } = req.query;

      if (!playerId || !platformId) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameters: playerId, platformId",
        });
      }

      const params = new URLSearchParams({
        playerId: playerId as string,
        platformId: platformId as string,
      });

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/risk/get_player_risk_profile?${params.toString()}`;

      console.log("=== Proxying Player Risk Profile Request ===");
      console.log("URL:", externalApiUrl);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for top players by bets
  app.get("/api/reports/top-bets", async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;

      if (!userId || !startDate || !endDate) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameters: userId, startDate, endDate",
        });
      }

      const params = new URLSearchParams({
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/report/get_top_players_by_bets?${params.toString()}`;

      console.log("=== Proxying Top Players by Bets ===");
      console.log("URL:", externalApiUrl);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for top players by wins
  app.get("/api/reports/top-wins", async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;

      if (!userId || !startDate || !endDate) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameters: userId, startDate, endDate",
        });
      }

      const params = new URLSearchParams({
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/report/get_top_players_by_wins?${params.toString()}`;

      console.log("=== Proxying Top Players by Wins ===");
      console.log("URL:", externalApiUrl);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for active players
  app.get("/api/reports/active-players", async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;

      if (!userId || !startDate || !endDate) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameters: userId, startDate, endDate",
        });
      }

      const params = new URLSearchParams({
        userId: userId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/report/get_active_players?${params.toString()}`;

      console.log("=== Proxying Active Players ===");
      console.log("URL:", externalApiUrl);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for user platforms
  app.get("/api/platforms", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameter: userId",
        });
      }

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/platform/get_user_platforms?userId=${userId}`;

      console.log("=== Proxying User Platforms ===");
      console.log("URL:", externalApiUrl);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "GET",
        headers,
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON. This usually means authentication failed or the endpoint is not available.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Proxy endpoint for update platform
  app.post("/api/platforms/update", async (req, res) => {
    try {
      const { platformId, updateData, userId } = req.body;

      if (!platformId) {
        return res.status(400).json({
          result: "error",
          message: "Missing required parameter: platformId",
        });
      }

      const normalizedUpdateData = {
        ...(updateData ?? {}),
        ...((updateData?.userId ?? updateData?.user_id ?? userId)
          ? {
              userId: updateData?.userId ?? updateData?.user_id ?? userId,
              user_id: updateData?.userId ?? updateData?.user_id ?? userId,
            }
          : {}),
        ...((updateData?.walletUrl ?? updateData?.wallet_url)
          ? {
              walletUrl: updateData?.walletUrl ?? updateData?.wallet_url,
              wallet_url: updateData?.walletUrl ?? updateData?.wallet_url,
            }
          : {}),
        ...((updateData?.skinTemplate ?? updateData?.template)
          ? {
              skinTemplate: updateData?.skinTemplate ?? updateData?.template,
              template: updateData?.skinTemplate ?? updateData?.template,
            }
          : {}),
      };

      const payload = {
        platformId,
        ...normalizedUpdateData,
        updateData: normalizedUpdateData,
      };

      const baseUrl = process.env.EXTERNAL_API_BASE_URL || "https://sports-admin-server.jbets.online";
      const externalApiUrl = `${baseUrl}/v1/platform/update_platform`;

      console.log("=== Proxying Update Platform ===");
      console.log("URL:", externalApiUrl);
      console.log("Payload:", payload);

      const token = await getAuthToken();
      const headers = getRequestHeaders(token);

      const response = await fetch(externalApiUrl, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const textBody = await response.text();
        console.error("Non-JSON response received:", textBody.substring(0, 500));
        return res.status(response.status).json({
          result: "error",
          message: `API returned ${contentType} instead of JSON.`,
          debug: textBody.substring(0, 200),
        });
      }

      if (!response.ok) {
        console.error("External API error:", response.status, data);
        return res.status(response.status).json(data);
      }

      return res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      return res.status(500).json({
        result: "error",
        message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
