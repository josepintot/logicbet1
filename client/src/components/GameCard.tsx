import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Activity, Disc, TrendingUp } from "lucide-react";
import { SiNba, SiPremierleague } from "react-icons/si";
import { format } from "date-fns";
import type { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  const isLive = game.status === 'live';

  const getSportIcon = (sport: string) => {
    const sportLower = sport.toLowerCase();
    if (sportLower === 'basketball') {
      return <SiNba className="w-5 h-5" />;
    }
    if (sportLower === 'football') {
      return <SiPremierleague className="w-5 h-5" />;
    }
    if (sportLower === 'tennis' || sportLower === 'baseball') {
      return <Disc className="w-5 h-5" />;
    }
    return <Activity className="w-5 h-5" />;
  };

  return (
    <Card className="p-6 space-y-6 hover-elevate" data-testid={`card-game-${game.id}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-foreground" data-testid={`icon-sport-${game.id}`}>
            {getSportIcon(game.sport)}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground" data-testid={`text-sport-${game.id}`}>
              {game.sport}
            </p>
            {game.league && (
              <p className="text-xs text-muted-foreground" data-testid={`text-league-${game.id}`}>{game.league}</p>
            )}
          </div>
        </div>
        {isLive && (
          <Badge variant="destructive" data-testid={`badge-live-${game.id}`}>
            Live
          </Badge>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold" data-testid={`text-home-team-${game.id}`}>{game.homeTeam}</span>
          <span className="font-mono text-sm font-medium text-primary" data-testid={`text-home-odds-${game.id}`}>
            {game.homeOdds}
          </span>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold" data-testid={`text-away-team-${game.id}`}>{game.awayTeam}</span>
          <span className="font-mono text-sm font-medium text-primary" data-testid={`text-away-odds-${game.id}`}>
            {game.awayOdds}
          </span>
        </div>
        {game.drawOdds && (
          <>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Draw</span>
              <span className="font-mono text-sm font-medium text-muted-foreground" data-testid={`text-draw-odds-${game.id}`}>
                {game.drawOdds}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid={`text-game-time-${game.id}`}>
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(game.gameTime), 'MMM d, h:mm a')}
        </div>
      </div>
    </Card>
  );
}
