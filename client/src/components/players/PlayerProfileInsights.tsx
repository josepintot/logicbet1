import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ProfilePlayer = {
  name?: string;
  playerName?: string;
  email?: string;
  id?: string | number;
  playerId?: string | number;
};

interface PlayerProfileInsightsProps {
  player?: ProfilePlayer | null;
  platformName?: string;
}

interface MockChartItem {
  name: string;
  value: number;
}

const CHART_COLORS = ['#fb6a6a', '#52c7c2', '#45b3cf', '#9cd3bb', '#f3c252'];

const TOP_SPORTS_DATA: MockChartItem[] = [
  { name: 'Tenis', value: 2206 },
  { name: 'Fútbol', value: 69 },
  { name: 'Basket', value: 1 },
];

const TOP_REGIONS_DATA: MockChartItem[] = [
  { name: 'EE.UU', value: 587 },
  { name: 'Brasil', value: 153 },
  { name: 'México', value: 153 },
  { name: 'España', value: 148 },
  { name: 'Francia', value: 134 },
];

const TOP_COMPETITIONS_DATA: MockChartItem[] = [
  { name: 'Compe 1388', value: 159 },
  { name: 'Compe 1389', value: 68 },
  { name: 'Compe 18292460', value: 58 },
  { name: 'Compe 4568', value: 47 },
  { name: 'Compe 29463', value: 41 },
];

const PREMATCH_VS_LIVE_DATA: MockChartItem[] = [
  { name: 'Live', value: 2273 },
  { name: 'Pre-match', value: 3 },
];

const RECENT_BETS = [
  {
    mercado: 'PIP2',
    deporte: 'Tenis',
    region: 'Ruanda',
    competencia: 'Compe 18288905',
    status: 'Live',
    apuestas: 1,
    ratio: '4.05x',
  },
  {
    mercado: 'GameWinner',
    deporte: 'Tenis',
    region: 'EE.UU',
    competencia: 'UTR Pro Series Boca Raton - Femenino',
    status: 'Live',
    apuestas: 1,
    ratio: '3.05x',
  },
  {
    mercado: 'SetWinner',
    deporte: 'Tenis',
    region: 'Croacia',
    competencia: 'Compe 18295670',
    status: 'Live',
    apuestas: 1,
    ratio: '2.65x',
  },
  {
    mercado: 'PIP2',
    deporte: 'Tenis',
    region: 'Partidos cibernéticos',
    competencia: 'Cyber Tennis AO2 Matches',
    status: 'Live',
    apuestas: 2,
    ratio: '2.63x',
  },
  {
    mercado: 'SetWinner',
    deporte: 'Tenis',
    region: 'Italia',
    competencia: 'ITF Femenino - Arcadia',
    status: 'Live',
    apuestas: 1,
    ratio: '2.21x',
  },
];

function SummaryMetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-0 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm">
      <CardContent className="p-6 text-center">
        <p className="text-base font-semibold opacity-95">{title}</p>
        <p className="mt-4 text-4xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function DonutChartCard({
  title,
  centerLabel,
  data,
}: {
  title: string;
  centerLabel: string;
  data: MockChartItem[];
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mx-auto h-40 w-full max-w-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={34} outerRadius={62} paddingAngle={1}>
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-600 text-[10px] font-bold">
                {centerLabel.toUpperCase()}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col items-center gap-2">
          {data.map((item, index) => (
            <div key={item.name} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
              <span>{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PlayerProfileInsights({ player, platformName = '-' }: PlayerProfileInsightsProps) {
  const displayName = player?.name ?? player?.playerName ?? '-';
  const displayEmail = player?.email ?? '-';
  const displayPlayerId = player?.playerId ?? player?.id ?? '-';

  return (
    <div className="space-y-6">
      <Card className="border border-primary/10 bg-slate-50/80 shadow-sm">
        <CardContent className="grid gap-4 p-5 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Nombre</p>
            <p className="font-semibold text-foreground">{displayName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-semibold text-foreground break-words">{displayEmail}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Plataforma</p>
            <p className="font-semibold text-foreground">{platformName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ID Jugador</p>
            <p className="font-semibold text-foreground break-all">{displayPlayerId}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryMetricCard title="Total De Apuestas" value="2276" />
        <SummaryMetricCard title="Ratio Global" value="0.92" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DonutChartCard title="Top 5 Deportes" centerLabel="Sport" data={TOP_SPORTS_DATA} />
        <DonutChartCard title="Top 5 Regiones" centerLabel="Región" data={TOP_REGIONS_DATA} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DonutChartCard title="Top 5 Competencias" centerLabel="Liga" data={TOP_COMPETITIONS_DATA} />
        <DonutChartCard title="Pre-match vs Live" centerLabel="Status" data={PREMATCH_VS_LIVE_DATA} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-800">Detalle Últimas Apuestas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mercado</TableHead>
                  <TableHead>Deporte</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Competencia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Apuestas</TableHead>
                  <TableHead>Ratio de Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_BETS.map((bet) => (
                  <TableRow key={`${bet.mercado}-${bet.competencia}`} className="bg-emerald-50/70 hover:bg-emerald-50">
                    <TableCell>{bet.mercado}</TableCell>
                    <TableCell>{bet.deporte}</TableCell>
                    <TableCell>{bet.region}</TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal">{bet.competencia}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                        {bet.status}
                      </span>
                    </TableCell>
                    <TableCell>{bet.apuestas}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                        {bet.ratio}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
