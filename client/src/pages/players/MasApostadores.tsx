import React, { useEffect, useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  formatMissingPlayerProfileFields,
  getMissingPlayerProfileFields,
  getPlayerPlatformName,
  getPlayerProfile,
  getPlayerRiskProfile,
  getTopPlayerCurrency,
  getTopPlayerMetricAmount,
  getTopPlayersByBets,
  formatPlayerAmountByCurrency,
  resolvePlayerProfileParams,
} from '@/lib/playersApi';
import { fetchUserPlatforms } from '@/lib/platformsApi';
import { PlayerRiskProfileInsights } from '@/components/players/PlayerRiskProfileInsights';

const MasApostadores = () => {
  const [currency, setCurrency] = useState('ARS');
  const [limit, setLimit] = useState('all');
  const [players, setPlayers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [riskProfileData, setRiskProfileData] = useState<any | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedPlatformName, setSelectedPlatformName] = useState('');
  const [platformNamesById, setPlatformNamesById] = useState<Record<string, string>>({});

  const userId = '685b1587a1d61f6aa349dc75';
  const currentMonthRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      label: `${start.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} - ${end.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}`,
      totalDays: end.getDate(),
    };
  }, []);
  const startDate = currentMonthRange.startDate;
  const endDate = currentMonthRange.endDate;

  const extractPlayers = (payload: any): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    const selectedCurrency = currency.toUpperCase();
    const preferredKeys = ['players', 'items', 'rows', 'results', 'list', 'data', 'records'];

    const directCurrencyList = payload?.[selectedCurrency] ?? payload?.[selectedCurrency.toLowerCase()];
    if (Array.isArray(directCurrencyList)) {
      return directCurrencyList.map((item) =>
        item && typeof item === 'object' ? { currency: item?.currency ?? selectedCurrency, ...item } : item,
      );
    }

    for (const key of preferredKeys) {
      if (Array.isArray(payload[key])) return payload[key];

      const nestedCurrencyList = payload?.[key]?.[selectedCurrency] ?? payload?.[key]?.[selectedCurrency.toLowerCase()];
      if (Array.isArray(nestedCurrencyList)) {
        return nestedCurrencyList.map((item) =>
          item && typeof item === 'object' ? { currency: item?.currency ?? selectedCurrency, ...item } : item,
        );
      }
    }

    const arrayEntries = Object.entries(payload).filter(([, value]) => Array.isArray(value));
    if (arrayEntries.length > 0) {
      const matchingCurrencyEntry = arrayEntries.find(([key]) => key.toUpperCase() === selectedCurrency);
      const sourceEntries = matchingCurrencyEntry ? [matchingCurrencyEntry] : arrayEntries;

      return sourceEntries.flatMap(([key, value]) =>
        (value as any[]).map((item) =>
          item && typeof item === 'object' ? { currency: item?.currency ?? key.toUpperCase(), ...item } : item,
        ),
      );
    }

    const firstArray = Object.values(payload).find((value) => Array.isArray(value));
    return Array.isArray(firstArray) ? firstArray : [];
  };

  useEffect(() => {
    const loadTopPlayers = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getTopPlayersByBets({ userId, startDate, endDate, currency });
        console.log("📥 Full response data:", data);
        const messageList = extractPlayers(data?.message);
        const dataList = extractPlayers(data?.data);
        const rootList = extractPlayers(data);

        const list = messageList.length ? messageList : dataList.length ? dataList : rootList;
        console.log("📋 Extracted players list:", list);
        setPlayers(list);
      } catch (err) {
        console.error("❌ Error loading players:", err);
        setLoadError('No se pudieron cargar los mejores apostadores.');
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

    loadTopPlayers();
    loadPlatforms();
  }, [userId, startDate, endDate, currency]);

  const handleLoadProfile = async (row: any) => {
    try {
      setIsProfileModalOpen(true);
      setSelectedPlatformName(getPlayerPlatformName(row, platformNamesById));
      const params = await resolvePlayerProfileParams(row, userId);
      const missingFields = getMissingPlayerProfileFields(params);

      if (missingFields.length > 0) {
        console.warn('⚠️ Missing player profile params', { row, params, missingFields });
        setProfileError(
          `Faltan datos del jugador para cargar el perfil: ${formatMissingPlayerProfileFields(missingFields)}.`,
        );
        setProfileData(null);
        setRiskProfileData(null);
        return;
      }

      setIsProfileLoading(true);
      setProfileError(null);
      const [data, riskData] = await Promise.all([
        getPlayerProfile(params),
        getPlayerRiskProfile({
          playerId: params.playerId,
          platformId: params.platformId,
        }),
      ]);
      setProfileData(data);
      setRiskProfileData(riskData);
    } catch (err) {
      console.error('❌ Error loading player profile:', err);
      setProfileError(err instanceof Error ? err.message : 'No se pudo cargar el perfil.');
      setProfileData(null);
      setRiskProfileData(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const resolvedProfilePlatformName = profileData
    ? getPlayerPlatformName(profileData?.message ?? profileData, platformNamesById)
    : '-';
  const displayProfilePlatformName = resolvedProfilePlatformName !== '-'
    ? resolvedProfilePlatformName
    : selectedPlatformName || '-';

  const visiblePlayers = useMemo(() => {
    const maxItems = limit === 'all' ? players.length : Number(limit) || players.length;

    return players
      .map((row) => ({
        row,
        rowCurrency: getTopPlayerCurrency(row, currency),
        amount: getTopPlayerMetricAmount(row, 'bets', currency),
      }))
      .slice(0, maxItems);
  }, [players, currency, limit]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />
      
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Top Players</h1>
            <p className="text-muted-foreground">Los jugadores con mayor cantidad apostada</p>
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
                    <p className="font-semibold">{currentMonthRange.label}</p>
                    <p className="text-xs text-muted-foreground">{currentMonthRange.totalDays} Días seleccionados</p>
                  </div>
                </div>
                <Button variant="outline" className="md:w-auto w-full">Cambiar rango</Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex gap-4 flex-col md:flex-row items-start md:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Divisa:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Mostrar:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos</option>
                <option value="20">20 Jugadores</option>
                <option value="50">50 Jugadores</option>
                <option value="100">100 Jugadores</option>
              </select>
            </div>
          </div>

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
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">TOTAL APOSTADO ({currency})</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">ID JUGADOR</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">NOMBRE JUGADOR</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">NOMBRE PLATAFORMA</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">PERFIL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePlayers.map(({ row, amount }, idx) => (
                      <tr key={row?.id ?? row?.playerId ?? idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-primary">
                          {formatPlayerAmountByCurrency(amount, currency)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{row?.id ?? row?.playerId ?? '-'}</td>
                        <td className="px-6 py-4 text-sm font-medium">{row?.name ?? row?.playerName ?? row?.username ?? '-'}</td>
                        <td className="px-6 py-4 text-sm">{getPlayerPlatformName(row, platformNamesById)}</td>
                        <td className="px-6 py-4 text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary"
                            onClick={() => handleLoadProfile(row)}
                            disabled={isProfileLoading}
                          >
                            {isProfileLoading ? 'Cargando...' : 'Perfil'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {!isLoading && visiblePlayers.length === 0 && !loadError && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              No se encontraron jugadores para la moneda seleccionada.
            </div>
          )}

          <Dialog
            open={isProfileModalOpen}
            onOpenChange={(open) => {
              setIsProfileModalOpen(open);
              if (!open) {
                setProfileData(null);
                setRiskProfileData(null);
                setProfileError(null);
              }
            }}
          >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl bg-white">
              <DialogHeader className="pb-4 border-b border-[#2664EC]/20">
                <DialogTitle className="text-xl font-bold text-[#0B132B]">Perfil del Jugador</DialogTitle>
              </DialogHeader>

              {isProfileLoading ? (
                <div className="py-6 text-sm text-muted-foreground">Cargando perfil...</div>
              ) : profileError ? (
                <p className="text-sm text-red-600">{profileError}</p>
              ) : profileData ? (
                <PlayerRiskProfileInsights
                  player={profileData?.message ?? profileData}
                  riskProfile={riskProfileData?.message ?? riskProfileData}
                  platformName={displayProfilePlatformName}
                />
              ) : (
                <div className="py-6 text-sm text-muted-foreground">Selecciona un jugador para ver su perfil.</div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default MasApostadores;
