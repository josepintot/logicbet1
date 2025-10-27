import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Calendar, Activity } from "lucide-react";
import type { Game } from "@shared/schema";

interface StatsOverviewProps {
  games: Game[];
  isLoading: boolean;
}

export default function StatsOverview({ games, isLoading }: StatsOverviewProps) {
  const liveCount = games.filter(g => g.status === 'live').length;
  const upcomingCount = games.filter(g => g.status === 'upcoming').length;
  const totalGames = games.length;

  const stats = [
    {
      label: 'Live Games',
      value: liveCount,
      icon: Activity,
      color: 'text-destructive',
    },
    {
      label: 'Upcoming',
      value: upcomingCount,
      icon: Calendar,
      color: 'text-primary',
    },
    {
      label: 'Total Games',
      value: totalGames,
      icon: TrendingUp,
      color: 'text-foreground',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6 space-y-3" data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-3xl font-bold font-mono ${stat.color}`} data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              {stat.value}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
