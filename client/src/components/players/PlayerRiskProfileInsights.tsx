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

interface RiskChartItem {
  name: string;
  value: number;
}

interface RecentBetItem {
  mercado: string;
  deporte: string;
  region: string;
  competencia: string;
  status: string;
  apuestas: string;
  ratio: string;
}

interface PlayerRiskProfileInsightsProps {
  player?: ProfilePlayer | null;
  riskProfile?: any;
  platformName?: string;
}

const CHART_COLORS = ['#fb6a6a', '#52c7c2', '#45b3cf', '#9cd3bb', '#f3c252'];
const SHOW_DEBUG_PAYLOAD = false;

function readString(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return text === 'undefined' || text === 'null' ? '' : text;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  const normalized = value.replace(/[^\d,.-]/g, '').trim();
  if (!normalized) return null;

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  let parsedValue = normalized;
  if (hasComma && hasDot) {
    parsedValue = normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
      ? normalized.replace(/\./g, '').replace(',', '.')
      : normalized.replace(/,/g, '');
  } else if (hasComma) {
    parsedValue = normalized.replace(',', '.');
  }

  const parsed = Number(parsedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function findFirstValue(source: any, paths: string[]): unknown {
  for (const path of paths) {
    const value = path.split('.').reduce<any>((acc, key) => acc?.[key], source);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function findNestedValueByKey(source: any, candidateKeys: string[]): unknown {
  if (!source || typeof source !== 'object') return undefined;

  const normalizedCandidates = candidateKeys.map(normalizeKey);
  const visited = new Set<any>();
  const queue: any[] = [source];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    for (const [key, value] of Object.entries(current)) {
      if (normalizedCandidates.includes(normalizeKey(key)) && value !== undefined && value !== null && value !== '') {
        return value;
      }

      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return undefined;
}

function pickPayload(payload: any): any {
  return payload?.message ?? payload?.data ?? payload ?? {};
}

function collectNestedArrays(source: any): any[][] {
  if (!source || typeof source !== 'object') return [];

  const visited = new Set<any>();
  const queue: any[] = [source];
  const arrays: any[][] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) {
      arrays.push(current);
      queue.push(...current);
      continue;
    }

    for (const value of Object.values(current)) {
      if (value && typeof value === 'object') {
        queue.push(value);
      }
    }
  }

  return arrays;
}

function toChartItemsFromValue(value: unknown): RiskChartItem[] {
  const directValue = value as any;

  if (Array.isArray(directValue)) {
    return directValue
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const name = readString(
          findFirstValue(item, [
            'name',
            'label',
            'title',
            'key',
            'sport',
            'sportName',
            'region',
            'regionName',
            'competition',
            'competitionName',
            'league',
            'status',
            'type',
            'marketReference',
          ])
        );
        const value = readNumber(
          findFirstValue(item, [
            'value',
            'count',
            'total',
            'amount',
            'bets',
            'apuestas',
            'qty',
            'quantity',
            'totalBetsQty',
            'betCount',
          ])
        );

        if (!name || value === null) return null;
        return { name, value };
      })
      .filter((item): item is RiskChartItem => Boolean(item));
  }

  if (directValue && typeof directValue === 'object') {
    return Object.entries(directValue)
      .map(([key, value]) => {
        const numericValue = readNumber(value);
        if (numericValue === null) return null;
        return {
          name: key,
          value: numericValue,
        };
      })
      .filter((item): item is RiskChartItem => Boolean(item));
  }

  return [];
}

function inferChartItemsFromArrays(payloads: any[], labelKeys: string[]): RiskChartItem[] {
  for (const source of payloads) {
    const payload = pickPayload(source);
    const arrays = collectNestedArrays(payload);

    for (const rows of arrays) {
      const chartItems = rows
        .map((row) => {
          if (!row || typeof row !== 'object') return null;

          const label = readString(
            findFirstValue(row, labelKeys) ??
              findNestedValueByKey(row, labelKeys),
          );
          const value = readNumber(
            findFirstValue(row, ['value', 'count', 'total', 'amount', 'bets', 'apuestas', 'qty', 'quantity']) ??
              findNestedValueByKey(row, ['value', 'count', 'total', 'amount', 'bets', 'apuestas', 'qty', 'quantity']),
          );

          if (!label || value === null) return null;
          return { name: label, value };
        })
        .filter((item): item is RiskChartItem => Boolean(item));

      if (chartItems.length > 0) {
        return chartItems;
      }
    }
  }

  return [];
}

function toChartItems(sources: any[], preferredKeys: string[] = [], fallbackKeys: string[] = [], inferLabelKeys: string[] = []): RiskChartItem[] {
  for (const source of sources) {
    const payload = pickPayload(source);
    const directValue = preferredKeys.length
      ? findFirstValue(payload, preferredKeys) ?? findNestedValueByKey(payload, [...preferredKeys, ...fallbackKeys])
      : payload;

    const chartItems = toChartItemsFromValue(directValue);
    if (chartItems.length > 0) {
      return chartItems;
    }
  }

  return inferLabelKeys.length > 0 ? inferChartItemsFromArrays(sources, inferLabelKeys) : [];
}

function toRecentBets(sources: any[]): RecentBetItem[] {
  const recentBetKeys = [
    'recentBets',
    'lastBets',
    'latestBets',
    'ultimasApuestas',
    'detalleUltimasApuestas',
    'bets',
    'betDetails',
    'lastFiveBets',
    'latestBetDetails',
    'recentBetDetails',
    'lastMovements',
    'betsWinToBetRatio',
  ];

  for (const source of sources) {
    const payload = pickPayload(source);
    const rows = findFirstValue(payload, recentBetKeys) ?? findNestedValueByKey(payload, recentBetKeys);

    if (!Array.isArray(rows)) continue;

    const parsedRows = rows
      .map((row) => {
        if (!row || typeof row !== 'object') return null;

        return {
          mercado: readString(findFirstValue(row, ['market', 'mercado', 'betType', 'wagerType', 'marketName', 'marketReference'])) || '-',
          deporte: readString(findFirstValue(row, ['sport', 'deporte', 'sportName'])) || '-',
          region: readString(findFirstValue(row, ['region', 'regionName', 'country', 'pais', 'countryName'])) || '-',
          competencia: readString(findFirstValue(row, ['competition', 'competitionName', 'competencia', 'league', 'tournament', 'leagueName'])) || '-',
          status: readString(findFirstValue(row, ['status', 'gameStatus', 'liveStatus', 'betStatus', 'type', 'betTypeName'])) || '-',
          apuestas: readString(findFirstValue(row, ['bets', 'apuestas', 'count', 'quantity', 'totalBets', 'betCount'])) || '-',
          ratio: readString(findFirstValue(row, ['ratio', 'ratioGlobal', 'profitRatio', 'odds', 'payoutRatio', 'globalRatio', 'winToBetRatio'])) || '-',
        };
      })
      .filter((row): row is RecentBetItem => Boolean(row));

    if (parsedRows.length > 0) {
      return parsedRows;
    }
  }

  return [];
}

function findMetricAcrossSources(
  sources: any[],
  directKeys: string[],
  nestedKeys: string[] = [],
): unknown {
  for (const source of sources) {
    const payload = pickPayload(source);
    const directValue = findFirstValue(payload, directKeys);
    if (directValue !== undefined && directValue !== null && directValue !== '') {
      return directValue;
    }

    const nestedValue = findNestedValueByKey(payload, [...directKeys, ...nestedKeys]);
    if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') {
      return nestedValue;
    }
  }

  return undefined;
}

function formatMetricValue(value: unknown, fallback = '-'): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  }

  const numericValue = readNumber(value);
  if (numericValue !== null) {
    return numericValue.toLocaleString('es-AR', { maximumFractionDigits: 2 });
  }

  const text = readString(value);
  return text || fallback;
}

function formatRatioValue(value: unknown, fallback = '-'): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const numericValue = readNumber(value);
  if (numericValue !== null) {
    return numericValue.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const text = readString(value);
  return text || fallback;
}

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
  data: RiskChartItem[];
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-semibold text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">Sin datos disponibles.</div>
        )}
      </CardContent>
    </Card>
  );
}

export function PlayerRiskProfileInsights({ player, riskProfile, platformName = '-' }: PlayerRiskProfileInsightsProps) {
  const displayName = player?.name ?? player?.playerName ?? '-';
  const displayEmail = player?.email ?? '-';
  const displayPlayerId = player?.playerId ?? player?.id ?? '-';
  const sources = [riskProfile, player];
  const totalBets = formatMetricValue(
    findMetricAcrossSources(
      sources,
      ['totalBets', 'total_bets', 'totalBet', 'total_apuestas'],
      ['betCount', 'cantidadApuestas'],
    ),
  );
  const globalRatio = formatMetricValue(
    findMetricAcrossSources(
      sources,
      ['globalRatio', 'ratioGlobal', 'global_ratio', 'ratio_global'],
      ['profitRatio', 'yield', 'hold', 'roi', 'margin', 'yieldGlobal', 'ratio'],
    ),
  );
  const exactGlobalRatio = formatRatioValue(
    findMetricAcrossSources(
      sources,
      ['globalWinToBetRatio.winToBetRatio'],
      ['globalWinToBetRatio', 'winToBetRatio'],
    ) ?? findMetricAcrossSources(sources, ['globalRatio', 'ratioGlobal'], ['profitRatio', 'yield', 'roi']),
  );
  const exactTopSports = toChartItemsFromValue(
    findMetricAcrossSources(sources, ['topSports'], ['top_sports', 'sports']) ?? [],
  );
  const exactTopRegions = toChartItemsFromValue(
    findMetricAcrossSources(sources, ['topRegions'], ['top_regions', 'regions']) ?? [],
  );
  const exactTopCompetitions = toChartItemsFromValue(
    findMetricAcrossSources(sources, ['topCompetitions'], ['top_competitions', 'competitions', 'leagues']) ?? [],
  );
  const exactPreMatchVsLive = toChartItemsFromValue(
    findMetricAcrossSources(sources, ['gameStatus'], ['statusDistribution', 'betStatus', 'liveVsPrematch']) ?? [],
  );
  const exactRecentBets = toRecentBets(sources);
  const topSports = exactTopSports.length > 0
    ? exactTopSports
    : toChartItems(
        sources,
        ['topSports', 'top_sports', 'sports'],
        ['sportStats', 'sportsStats', 'top5Sports', 'sportsDistribution'],
        ['sport', 'deporte', 'sportName'],
      );
  const topRegions = exactTopRegions.length > 0
    ? exactTopRegions
    : toChartItems(
        sources,
        ['topRegions', 'top_regions', 'regions'],
        ['regionStats', 'top5Regions', 'countryDistribution', 'countries'],
        ['region', 'country', 'pais', 'countryName'],
      );
  const topCompetitions = exactTopCompetitions.length > 0
    ? exactTopCompetitions
    : toChartItems(
        sources,
        ['topCompetitions', 'top_competitions', 'competitions', 'leagues'],
        ['competitionStats', 'leagueStats', 'top5Competitions', 'topLeagues'],
        ['competition', 'competencia', 'league', 'tournament', 'leagueName'],
      );
  const preMatchVsLive = exactPreMatchVsLive.length > 0
    ? exactPreMatchVsLive
    : toChartItems(
        sources,
        ['preMatchVsLive', 'pre_match_vs_live', 'statusDistribution', 'betStatus'],
        ['betTypes', 'liveVsPrematch', 'livePreMatch', 'wagerStatusDistribution'],
        ['status', 'liveStatus', 'betStatus', 'type'],
      );
  const recentBets = exactRecentBets.length > 0 ? exactRecentBets : toRecentBets(sources);
  const shouldShowDebugPayload =
    SHOW_DEBUG_PAYLOAD &&
    exactGlobalRatio === '-' &&
    topSports.length === 0 &&
    topRegions.length === 0 &&
    topCompetitions.length === 0 &&
    preMatchVsLive.length === 0 &&
    recentBets.length === 0;

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
        <SummaryMetricCard title="Total De Apuestas" value={totalBets} />
        <SummaryMetricCard title="Ratio Global" value={exactGlobalRatio || globalRatio} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DonutChartCard title="Top 5 Deportes" centerLabel="Sport" data={topSports} />
        <DonutChartCard title="Top 5 Regiones" centerLabel="Region" data={topRegions} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DonutChartCard title="Top 5 Competencias" centerLabel="Liga" data={topCompetitions} />
        <DonutChartCard title="Pre-match vs Live" centerLabel="Status" data={preMatchVsLive} />
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-800">Detalle Ultimas Apuestas</CardTitle>
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
                {recentBets.length > 0 ? (
                  recentBets.map((bet, index) => (
                    <TableRow key={`${bet.mercado}-${bet.competencia}-${index}`} className="bg-emerald-50/70 hover:bg-emerald-50">
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      Sin apuestas recientes para mostrar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {shouldShowDebugPayload && (
        <Card className="border border-amber-200 bg-amber-50/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-amber-900">Debug Payload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-900">
              No se pudieron mapear automaticamente los datos del perfil. Usa este bloque para copiar la estructura real de la respuesta.
            </p>
            <div>
              <p className="mb-2 text-sm font-semibold text-amber-900">Risk Profile</p>
              <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                {JSON.stringify(riskProfile, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-amber-900">Player Profile</p>
              <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                {JSON.stringify(player, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
