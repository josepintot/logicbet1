import type { Express, RequestHandler } from "express";

export async function setupAuth(app: Express) {
  // No backend auth needed - using external API
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  // No auth check - frontend handles everything
  next();
};
