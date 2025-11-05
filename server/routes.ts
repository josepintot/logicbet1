import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./localAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware (no-op - using external API)
  await setupAuth(app);

  // No backend routes needed - using external API only
  
  const httpServer = createServer(app);
  return httpServer;
}
