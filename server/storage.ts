// Referenced from javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  games,
  bets,
  type User,
  type UpsertUser,
  type Game,
  type InsertGame,
  type Bet,
  type InsertBet,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Game operations
  getAllGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  
  // Bet operations
  getUserBets(userId: string): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Game operations
  async getAllGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(games.gameTime);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(gameData).returning();
    return game;
  }

  // Bet operations
  async getUserBets(userId: string): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.placedAt));
  }

  async createBet(betData: InsertBet): Promise<Bet> {
    const [bet] = await db.insert(bets).values(betData).returning();
    return bet;
  }
}

export const storage = new DatabaseStorage();
