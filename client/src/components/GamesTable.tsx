import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity, Disc } from "lucide-react";
import { SiNba, SiPremierleague } from "react-icons/si";
import type { Game } from "@shared/schema";

interface GamesTableProps {
  games: Game[];
}

export default function GamesTable({ games }: GamesTableProps) {
  const getSportIcon = (sport: string) => {
    const sportLower = sport.toLowerCase();
    if (sportLower === 'basketball') {
      return <SiNba className="w-6 h-6" />;
    }
    if (sportLower === 'football') {
      return <SiPremierleague className="w-6 h-6" />;
    }
    if (sportLower === 'tennis' || sportLower === 'baseball') {
      return <Disc className="w-6 h-6" />;
    }
    return <Activity className="w-6 h-6" />;
  };

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <Card 
          key={game.id} 
          className="p-6 hover-elevate" 
          data-testid={`row-game-${game.id}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Game Info */}
            <div className="flex items-center gap-4 flex-1">
              <div className="text-foreground" data-testid={`icon-sport-table-${game.id}`}>{getSportIcon(game.sport)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground" data-testid={`text-sport-table-${game.id}`}>
                    {game.sport}
                  </p>
                  {game.league && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground" data-testid={`text-league-table-${game.id}`}>{game.league}</p>
                    </>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="font-semibold truncate" data-testid={`text-teams-table-${game.id}`}>{game.homeTeam} vs {game.awayTeam}</p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-time-table-${game.id}`}>
                    {format(new Date(game.gameTime), 'MMMM d, yyyy • h:mm a')}
                  </p>
                </div>
              </div>
            </div>

            {/* Odds */}
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Home</p>
                <p className="font-mono font-medium text-primary" data-testid={`text-odds-home-${game.id}`}>
                  {game.homeOdds}
                </p>
              </div>
              {game.drawOdds && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Draw</p>
                  <p className="font-mono font-medium text-muted-foreground" data-testid={`text-odds-draw-${game.id}`}>
                    {game.drawOdds}
                  </p>
                </div>
              )}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Away</p>
                <p className="font-mono font-medium text-primary" data-testid={`text-odds-away-${game.id}`}>
                  {game.awayOdds}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
