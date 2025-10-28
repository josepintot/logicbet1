import 'dotenv/config';
import { db } from "./db";
import { games } from "@shared/schema";

async function seed() {
  console.log("Seeding database with sample betting data...");

  const sampleGames = [
    // Football (Soccer)
    {
      sport: "Football",
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      homeOdds: "2.15",
      awayOdds: "3.40",
      drawOdds: "3.25",
      gameTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: "live",
      league: "Premier League",
    },
    {
      sport: "Football",
      homeTeam: "Real Madrid",
      awayTeam: "Barcelona",
      homeOdds: "2.50",
      awayOdds: "2.80",
      drawOdds: "3.40",
      gameTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      status: "upcoming",
      league: "La Liga",
    },
    {
      sport: "Football",
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      homeOdds: "1.95",
      awayOdds: "4.20",
      drawOdds: "3.60",
      gameTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
      status: "upcoming",
      league: "Bundesliga",
    },
    {
      sport: "Football",
      homeTeam: "Paris Saint-Germain",
      awayTeam: "Marseille",
      homeOdds: "1.75",
      awayOdds: "5.00",
      drawOdds: "3.80",
      gameTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: "upcoming",
      league: "Ligue 1",
    },
    
    // Basketball
    {
      sport: "Basketball",
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Golden State Warriors",
      homeOdds: "1.90",
      awayOdds: "2.00",
      drawOdds: null,
      gameTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      status: "live",
      league: "NBA",
    },
    {
      sport: "Basketball",
      homeTeam: "Boston Celtics",
      awayTeam: "Miami Heat",
      homeOdds: "1.85",
      awayOdds: "2.05",
      drawOdds: null,
      gameTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      status: "upcoming",
      league: "NBA",
    },
    {
      sport: "Basketball",
      homeTeam: "Milwaukee Bucks",
      awayTeam: "Phoenix Suns",
      homeOdds: "2.10",
      awayOdds: "1.80",
      drawOdds: null,
      gameTime: new Date(Date.now() + 36 * 60 * 60 * 1000), // 1.5 days from now
      status: "upcoming",
      league: "NBA",
    },
    
    // Tennis
    {
      sport: "Tennis",
      homeTeam: "Carlos Alcaraz",
      awayTeam: "Novak Djokovic",
      homeOdds: "2.20",
      awayOdds: "1.70",
      drawOdds: null,
      gameTime: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
      status: "upcoming",
      league: "ATP Finals",
    },
    {
      sport: "Tennis",
      homeTeam: "Iga Swiatek",
      awayTeam: "Aryna Sabalenka",
      homeOdds: "1.95",
      awayOdds: "1.95",
      drawOdds: null,
      gameTime: new Date(Date.now() + 30 * 60 * 60 * 1000), // 1.25 days from now
      status: "upcoming",
      league: "WTA Finals",
    },
    
    // Baseball
    {
      sport: "Baseball",
      homeTeam: "New York Yankees",
      awayTeam: "Boston Red Sox",
      homeOdds: "1.80",
      awayOdds: "2.15",
      drawOdds: null,
      gameTime: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
      status: "upcoming",
      league: "MLB",
    },
    {
      sport: "Baseball",
      homeTeam: "Los Angeles Dodgers",
      awayTeam: "San Francisco Giants",
      homeOdds: "1.75",
      awayOdds: "2.25",
      drawOdds: null,
      gameTime: new Date(Date.now() + 44 * 60 * 60 * 1000), // 1.8 days from now
      status: "upcoming",
      league: "MLB",
    },
    
    // Hockey
    {
      sport: "Hockey",
      homeTeam: "Toronto Maple Leafs",
      awayTeam: "Montreal Canadiens",
      homeOdds: "1.85",
      awayOdds: "2.05",
      drawOdds: "4.50",
      gameTime: new Date(Date.now() + 15 * 60 * 60 * 1000), // 15 hours from now
      status: "upcoming",
      league: "NHL",
    },
  ];

  for (const game of sampleGames) {
    await db.insert(games).values(game);
  }

  console.log(`✓ Seeded ${sampleGames.length} games successfully!`);
}

seed()
  .then(() => {
    console.log("Seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
