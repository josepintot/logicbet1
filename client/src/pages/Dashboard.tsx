import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, Activity } from "lucide-react";
import type { Game } from "@shared/schema";
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";
import GameCard from "@/components/GameCard";
import StatsOverview from "@/components/StatsOverview";
import GamesTable from "@/components/GamesTable";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const upcomingGames = games?.filter(g => g.status === 'upcoming') || [];
  const liveGames = games?.filter(g => g.status === 'live') || [];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="Logic Bet" className="h-16 w-auto object-contain" data-testid="img-logo-dashboard" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8" data-testid="avatar-user">
                <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || 'User'} className="object-cover" />
                <AvatarFallback className="text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 md:px-16 lg:px-24 py-12 space-y-12">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight">
            Welcome back, <span className="font-semibold">{user?.firstName}</span>
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Here's what's happening in sports betting today.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview games={games || []} isLoading={gamesLoading} />

        {/* Live Games */}
        {liveGames.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-medium" data-testid="heading-live-games">Live Now</h2>
              <div className="flex items-center gap-2" data-testid="indicator-live">
                <Activity className="w-4 h-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Live</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gamesLoading ? (
                <>
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-48 rounded-xl" />
                  <Skeleton className="h-48 rounded-xl" />
                </>
              ) : (
                liveGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Upcoming Games */}
        <section className="space-y-6">
          <h2 className="text-2xl font-medium" data-testid="heading-upcoming-games">Upcoming Games</h2>
          {gamesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          ) : upcomingGames.length > 0 ? (
            <GamesTable games={upcomingGames} />
          ) : (
            <Card className="p-12" data-testid="card-empty-games">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-lg bg-muted flex items-center justify-center opacity-20">
                  <Activity className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-medium">No Upcoming Games</h3>
                <p className="text-sm text-muted-foreground">
                  Check back later for new betting opportunities.
                </p>
              </div>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
