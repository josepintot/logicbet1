import React from 'react';
import { CalendarDays, Goal, Flame, Trophy, Clock3 } from 'lucide-react';
import { SidebarMenu } from '@/components/SidebarMenu';
import { Card, CardContent } from '@/components/ui/card';

const dateRange = '30 mar - 28 abr';

const summaryStats = [
  { label: 'Encuentros', value: '20' },
  { label: 'Total Apostado', value: '10234' },
  { label: 'Promedio', value: '511.7' },
];

const sportsDistribution = [
  { sport: 'Soccer', value: 20, percent: 100 },
];

const topBetMatches = [
  { rank: 1, teams: 'CA River Plate BA vs Boca Juniors', date: '8 marzo', time: '19:30', daysAgo: 20, bets: 2841 },
  { rank: 2, teams: 'Bayern Munich vs Real Madrid', date: '18 abril', time: '14:00', daysAgo: 9, bets: 679 },
  { rank: 3, teams: 'Universidad Catolica vs DCs Junior', date: '17 abril', time: '15:00', daysAgo: 10, bets: 604 },
  { rank: 4, teams: 'Atletico Madrid vs Barcelona', date: '15 abril', time: '19:30', daysAgo: 12, bets: 577 },
  { rank: 5, teams: 'Arsenal vs Sporting CP', date: '13 abril', time: '18:30', daysAgo: 14, bets: 534 },
  { rank: 6, teams: 'Boca Juniors vs Barcelona Guayaquil', date: '13 abril', time: '21:00', daysAgo: 14, bets: 507 },
  { rank: 7, teams: 'Barcelona vs Atletico Madrid', date: '12 abril', time: '16:00', daysAgo: 15, bets: 505 },
  { rank: 8, teams: 'Liverpool vs Paris Saint-Germain', date: '10 abril', time: '17:00', daysAgo: 17, bets: 502 },
];

const mostBackedMatches = [
  { time: '19:30', date: '28 abr 2026', daysAgo: 0, teams: 'CA River Plate BA vs Al Adalah', bets: 425 },
  { time: '18:30', date: '28 abr 2026', daysAgo: 0, teams: 'CA Rosario Central vs CA Sarmiento Junin', bets: 422 },
  { time: '18:30', date: '18 abr 2026', daysAgo: 10, teams: 'CA Talleres de Cordoba vs Deportivo Riestra', bets: 417 },
  { time: '15:00', date: '18 abr 2026', daysAgo: 10, teams: 'CA River Plate BA vs Boca Juniors', bets: 404 },
  { time: '19:30', date: '15 abr 2026', daysAgo: 13, teams: 'CA River Plate BA vs Carabobo FC', bets: 494 },
  { time: '19:30', date: '13 abr 2026', daysAgo: 15, teams: 'Fluminense vs Independiente Rivadavia', bets: 498 },
  { time: '14:00', date: '8 abr 2026', daysAgo: 20, teams: 'Bayern Munich vs Real Madrid', bets: 679 },
];

function formatCount(value: number) {
  return new Intl.NumberFormat('es-AR').format(value);
}

export default function EncuentrosPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />

      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card className="shadow-sm border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Rango seleccionado</p>
                  <h1 className="text-lg font-semibold text-foreground">{dateRange}</h1>
                  <p className="text-sm text-muted-foreground">30 dias visualizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="rounded-[28px] bg-gradient-to-r from-[#6677e9] via-[#5d68d8] to-[#7a4eb6] px-6 py-8 text-white shadow-lg shadow-primary/10 md:px-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Trophy className="w-6 h-6 text-amber-300" />
                <span>Top Encuentros</span>
              </div>
              <p className="max-w-2xl text-sm text-white/85">
                Analisis completo de eventos deportivos y apuestas
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 md:gap-8">
              {summaryStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-extrabold tracking-tight">{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <Card className="border-primary/10 shadow-sm">
            <CardContent className="p-5 md:p-6 space-y-4">
              <div className="text-center">
                <h2 className="text-sm font-semibold text-[#0B132B] flex items-center justify-center gap-2">
                  <Goal className="w-4 h-4 text-primary" />
                  Distribucion por Deportes
                </h2>
              </div>

              {sportsDistribution.map((item) => (
                <div key={item.sport} className="rounded-2xl border border-primary/10 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Goal className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-primary/10 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6677e9] to-[#7a4eb6]" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                    <div className="min-w-[72px] text-right leading-tight">
                      <div className="text-[11px] font-semibold text-[#0B132B]">{item.sport}</div>
                      <div className="text-[10px] text-muted-foreground">{item.value} (100.0%)</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 text-center">
                  <h2 className="text-sm font-semibold text-[#0B132B] flex items-center justify-center gap-2">
                    <Flame className="w-4 h-4 text-[#ff6b4a]" />
                    Encuentros con Mas Apuestas
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Ordenados por cantidad de apuestas</p>
                </div>

                <div className="space-y-3">
                  {topBetMatches.map((match) => (
                    <div
                      key={`${match.rank}-${match.teams}`}
                      className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {match.rank}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[#2444b2]">{match.teams}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          <span>{match.date}</span>
                          <span>{match.time}</span>
                          <span>Hace {match.daysAgo} dias</span>
                        </div>
                      </div>
                      <div className="rounded-full bg-[#ff4b4b] px-3 py-1 text-xs font-bold text-white shadow-sm">
                        {formatCount(match.bets)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 text-center">
                  <h2 className="text-sm font-semibold text-[#0B132B] flex items-center justify-center gap-2">
                    <Clock3 className="w-4 h-4 text-primary" />
                    Encuentros Mas Apostados
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Ordenados por fecha (mas reciente primero)</p>
                </div>

                <div className="space-y-3">
                  {mostBackedMatches.map((match) => (
                    <div
                      key={`${match.date}-${match.time}-${match.teams}`}
                      className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-3 py-3 shadow-sm"
                    >
                      <div className="min-w-[60px] rounded-xl bg-[#f3f6ff] px-2 py-2 text-center text-[10px] leading-tight text-[#5d68d8]">
                        <div className="font-bold text-xs">{match.time}</div>
                        <div className="mt-1 uppercase">{match.date}</div>
                        <div className="mt-1 text-muted-foreground">Hace {match.daysAgo} dias</div>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Goal className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#0B132B]">{match.teams}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatCount(match.bets)} apuestas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}