import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  decimal,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Games table - Sports betting games/matches
export const games = pgTable("games", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sport: varchar("sport", { length: 50 }).notNull(), // football, basketball, tennis, etc.
  homeTeam: varchar("home_team", { length: 255 }).notNull(),
  awayTeam: varchar("away_team", { length: 255 }).notNull(),
  homeOdds: decimal("home_odds", { precision: 5, scale: 2 }).notNull(),
  awayOdds: decimal("away_odds", { precision: 5, scale: 2 }).notNull(),
  drawOdds: decimal("draw_odds", { precision: 5, scale: 2 }), // nullable for sports without draws
  gameTime: timestamp("game_time").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('upcoming'), // upcoming, live, completed
  league: varchar("league", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Bets table - User bets
export const bets = pgTable("bets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  betType: varchar("bet_type", { length: 20 }).notNull(), // home, away, draw
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  odds: decimal("odds", { precision: 5, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, won, lost
  placedAt: timestamp("placed_at").defaultNow(),
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
});

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;
