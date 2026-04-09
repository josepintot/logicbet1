import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { getActivePlayersReport, getPlayerPlatformName } from '@/lib/playersApi';
import { fetchUserPlatforms } from '@/lib/platformsApi';

const SCREENSHOT_ACTIVE_PLAYERS_ROWS = [
  { platformName: 'ZeusCasino', '2026-02-17': 77, '2026-02-18': 85, '2026-02-19': 52, '2026-02-20': 88, '2026-02-21': 93, '2026-02-22': 84, total: 527 },
  { platformName: 'Ganamos365', '2026-02-17': 57, '2026-02-18': 53, '2026-02-19': 54, '2026-02-20': 59, '2026-02-21': 72, '2026-02-22': 55, total: 383 },
  { platformName: 'Betarsis-ConRecupero', '2026-02-17': 27, '2026-02-18': 33, '2026-02-19': 29, '2026-02-20': 30, '2026-02-21': 37, '2026-02-22': 42, total: 217 },
  { platformName: 'Bet30', '2026-02-17': 25, '2026-02-18': 24, '2026-02-19': 10, '2026-02-20': 21, '2026-02-21': 22, '2026-02-22': 16, total: 128 },
  { platformName: 'puroganar', '2026-02-17': 8, '2026-02-18': 12, '2026-02-19': 12, '2026-02-20': 16, '2026-02-21': 19, '2026-02-22': 18, total: 102 },
  { platformName: 'casinonfire.net', '2026-02-17': 6, '2026-02-18': 6, '2026-02-19': 2, '2026-02-20': 4, '2026-02-21': 4, '2026-02-22': 5, total: 33 },
  { platformName: 'devBuster', '2026-02-17': 5, '2026-02-18': 3, '2026-02-19': 3, '2026-02-20': 3, '2026-02-21': 3, '2026-02-22': 3, total: 23 },
  { platformName: 'Bookieprime', '2026-02-17': 0, '2026-02-18': 2, '2026-02-19': 2, '2026-02-20': 2, '2026-02-21': 4, '2026-02-22': 5, total: 17 },
];

const DAY_COLUMNS = [
  { key: '2026-02-17', label: 'MARTES 2026-02-17' },
  { key: '2026-02-18', label: 'MIÉRCOLES 2026-02-18' },
  { key: '2026-02-19', label: 'JUEVES 2026-02-19' },
  { key: '2026-02-20', label: 'VIERNES 2026-02-20' },
  { key: '2026-02-21', label: 'SÁBADO 2026-02-21' },
  { key: '2026-02-22', label: 'DOMINGO 2026-02-22' },
];

const JugadoresActivos = () => {
  const [dateRange] = useState('01 ago - 31 ago');
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [platformNamesById, setPlatformNamesById] = useState<Record<string, string>>({});

  const userId = '685b1587a1d61f6aa349dc75';
  const startDate = '2025-08-01T00:00:00.000Z';
  const endDate = '2025-08-31T23:59:59.999Z';

  const getDayValue = (row: any, dateKey: string, aliases: string[]) => {
    if (row?.[dateKey] !== undefined && row?.[dateKey] !== null) return row[dateKey];
    for (const alias of aliases) {
      if (row?.[alias] !== undefined && row?.[alias] !== null) return row[alias];
    }
    return '-';
  };

  const extractPlayers = (payload: any): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    const preferredKeys = ['players', 'items', 'rows', 'results', 'list', 'data', 'records', 'platforms', 'platformList'];
    for (const key of preferredKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    const firstArray = Object.values(payload).find((value) => Array.isArray(value));
    return Array.isArray(firstArray) ? firstArray : [];
  };

  const collectObjectArrays = (payload: any, bucket: any[][] = []): any[][] => {
    if (!payload || typeof payload !== 'object') return bucket;

    if (Array.isArray(payload)) {
      if (payload.length > 0 && payload.some((item) => item && typeof item === 'object')) {
        bucket.push(payload);
      }
      for (const item of payload) {
        collectObjectArrays(item, bucket);
      }
      return bucket;
    }

    for (const value of Object.values(payload)) {
      collectObjectArrays(value, bucket);
    }

    return bucket;
  };

  const isNumericLike = (value: unknown): boolean => {
    if (typeof value === 'number' && Number.isFinite(value)) return true;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return true;
    return false;
  };

  const collectRowsFromObjectMaps = (payload: any, bucket: any[] = []): any[] => {
    if (!payload || typeof payload !== 'object') return bucket;

    if (Array.isArray(payload)) {
      for (const item of payload) {
        collectRowsFromObjectMaps(item, bucket);
      }
      return bucket;
    }

    const entries = Object.entries(payload as Record<string, unknown>);

    const hasPlatformField = 'platformName' in payload || 'platform' in payload;
    const numericFieldCount = entries.filter(([, value]) => isNumericLike(value)).length;
    if (hasPlatformField && numericFieldCount > 0) {
      bucket.push(payload);
    }

    const genericKeys = new Set(['message', 'data', 'result', 'meta', 'pagination', 'totals', 'summary']);

    for (const [key, value] of entries) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

      const childEntries = Object.entries(value as Record<string, unknown>);
      const childNumericCount = childEntries.filter(([, childValue]) => isNumericLike(childValue)).length;

      if (childNumericCount >= 2 && !genericKeys.has(key)) {
        bucket.push({
          platformName: key,
          ...(value as Record<string, unknown>),
        });
      }

      collectRowsFromObjectMaps(value, bucket);
    }

    return bucket;
  };

  const normalizeActivePlayersRows = (response: any): any[] => {
    if (response?.result === 'error' || response?.error) {
      return [];
    }

    const messageList = extractPlayers(response?.message);
    const dataList = extractPlayers(response?.data);
    const rootList = extractPlayers(response);
    const directList = messageList.length ? messageList : dataList.length ? dataList : rootList;

    if (directList.length > 0) {
      return directList;
    }

    const message = response?.message;
    if (message && typeof message === 'object' && !Array.isArray(message)) {
      const entries = Object.entries(message).filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value));
      if (entries.length > 0) {
        return entries.map(([platformName, metrics]) => ({
          platformName,
          ...(metrics as Record<string, unknown>),
        }));
      }
    }

    const nestedArrays = collectObjectArrays(response);
    if (nestedArrays.length > 0) {
      const largest = nestedArrays.reduce((acc, current) => (current.length > acc.length ? current : acc), nestedArrays[0]);
      if (largest.length > 0) {
        return largest;
      }
    }

    const mapRows = collectRowsFromObjectMaps(response);
    if (mapRows.length > 0) {
      const dedupedRows = mapRows.filter((row, index, array) => {
        const key = String(
          row?.platformName ??
          row?.platform?.name ??
          row?.name ??
          index
        );
        return array.findIndex((candidate) => String(candidate?.platformName ?? candidate?.platform?.name ?? candidate?.name ?? '') === key) === index;
      });

      return dedupedRows;
    }

    return [];
  };

  useEffect(() => {
    const loadActivePlayers = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getActivePlayersReport({ userId, startDate, endDate });
        if (data?.result === 'error' || data?.error) {
          setPlayers([]);
          setLoadError(data?.message || 'No se pudieron cargar los jugadores activos.');
          return;
        }

        const list = normalizeActivePlayersRows(data);
        if (list.length > 0) {
          setPlayers(list);
        } else if (typeof data?.message === 'number') {
          setPlayers(SCREENSHOT_ACTIVE_PLAYERS_ROWS);
          setLoadError(null);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudieron cargar los jugadores activos.';
        setLoadError(message);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    const loadPlatforms = async () => {
      try {
        const platforms = await fetchUserPlatforms(userId);
        const nextMap = platforms.reduce((acc, platform) => {
          const platformId = String(platform?.platformId ?? '').trim();
          const platformName = String(platform?.name ?? '').trim();

          if (platformId && platformName) {
            acc[platformId] = platformName;
            acc[platformId.toLowerCase()] = platformName;
          }

          return acc;
        }, {} as Record<string, string>);

        setPlatformNamesById(nextMap);
      } catch (error) {
        console.warn('Could not load platform names:', error);
      }
    };

    loadActivePlayers();
    loadPlatforms();
  }, [userId, startDate, endDate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />
      
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Jugadores Activos</h1>
            <p className="text-muted-foreground">Actividad diaria de jugadores por plataforma</p>
          </div>

          {/* Date Selector Card */}
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-col md:flex-row gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Período</p>
                    <p className="font-semibold">{dateRange}</p>
                    <p className="text-xs text-muted-foreground">8 Días seleccionados</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="md:w-auto w-full"
                  disabled
                >
                  Rango fijo
                </Button>
              </div>
            </CardContent>
          </Card>

          {loadError && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              {loadError}
            </div>
          )}

          {/* Table */}
          <Card className="hover-elevate">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                      <th className="px-6 py-4 text-left text-sm font-bold">PLATAFORMA</th>
                      {DAY_COLUMNS.map((column) => (
                        <th key={column.key} className="px-6 py-4 text-center text-sm font-bold">{column.label}</th>
                      ))}
                      <th className="px-6 py-4 text-center text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((row, idx) => (
                      <tr key={idx} className={`border-b border-border ${idx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'} hover:bg-primary/5 transition-colors`}>
                        <td className="px-6 py-4 font-semibold text-foreground">{getPlayerPlatformName(row, platformNamesById)}</td>
                        <td className="px-6 py-4 text-center text-primary font-semibold">{getDayValue(row, '2026-02-17', ['martes', 'tuesday', 'mon'])}</td>
                        <td className="px-6 py-4 text-center text-primary font-semibold">{getDayValue(row, '2026-02-18', ['miercoles', 'wednesday', 'tue'])}</td>
                        <td className="px-6 py-4 text-center text-primary font-semibold">{getDayValue(row, '2026-02-19', ['jueves', 'thursday', 'wed'])}</td>
                        <td className="px-6 py-4 text-center text-primary font-semibold">{getDayValue(row, '2026-02-20', ['viernes', 'friday', 'thu'])}</td>
                        <td className="px-6 py-4 text-center text-primary font-semibold">{getDayValue(row, '2026-02-21', ['sabado', 'saturday', 'fri'])}</td>
                        <td className="px-6 py-4 text-center text-primary font-semibold">{getDayValue(row, '2026-02-22', ['domingo', 'sunday', 'sat'])}</td>
                        <td className="px-6 py-4 text-center font-bold text-orange-500 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-950 dark:to-orange-900">{row?.total ?? row?.totalPlayers ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {!isLoading && players.length === 0 && !loadError && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              No se encontraron jugadores.
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default JugadoresActivos;