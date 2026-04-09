import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { searchPlayers } from '@/lib/playersApi';

const BuscarJugador = () => {
  const [searchOption, setSearchOption] = useState<'group' | 'id' | 'name' | 'email'>('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const extractPlayers = (payload: any): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    const preferredKeys = ['players', 'items', 'rows', 'results', 'list', 'data', 'records', 'users'];
    for (const key of preferredKeys) {
      if (Array.isArray(payload[key])) return payload[key];
    }

    const firstArray = Object.values(payload).find((value) => Array.isArray(value));
    return Array.isArray(firstArray) ? firstArray : [];
  };

  const extractTotal = (response: any, fallbackLength: number): number => {
    const message = response?.message ?? response?.data ?? response;
    const totalCandidates = [
      message?.total,
      message?.totalPlayers,
      message?.count,
      message?.pagination?.total,
      message?.pagination?.totalItems,
    ];

    for (const candidate of totalCandidates) {
      if (typeof candidate === 'number') return candidate;
    }

    return fallbackLength;
  };

  const extractTotalPages = (response: any): number => {
    const message = response?.message ?? response?.data ?? response;
    const pageCandidates = [
      message?.totalPages,
      message?.pagination?.totalPages,
      message?.pages,
    ];

    for (const candidate of pageCandidates) {
      if (typeof candidate === 'number' && candidate > 0) return candidate;
    }

    return 1;
  };

  const mergeUniquePlayers = (list: any[]): any[] => {
    const seen = new Set<string>();
    const merged: any[] = [];

    for (const player of list) {
      const key = String(
        player?.id ??
        player?.playerId ??
        player?.email ??
        player?.username ??
        player?.userName ??
        JSON.stringify(player)
      );

      if (!seen.has(key)) {
        seen.add(key);
        merged.push(player);
      }
    }

    return merged;
  };

  const getPlayersFromResponse = (response: any): any[] => {
    const primaryPlayers = extractPlayers(response?.message);
    const fallbackDataPlayers = extractPlayers((response as any)?.data);
    const fallbackRootPlayers = extractPlayers(response);

    return primaryPlayers.length
      ? primaryPlayers
      : fallbackDataPlayers.length
        ? fallbackDataPlayers
        : fallbackRootPlayers;
  };

  const searchPlayersAllPages = async (
    filter: 'group' | 'id' | 'name' | 'email' | 'username' | 'userName' | 'playerId' | 'userId',
    text: string,
  ): Promise<{ players: any[]; total: number }> => {
    const firstPage = await searchPlayers({ filter, page: 1, text });
    const firstPlayers = getPlayersFromResponse(firstPage);
    const total = extractTotal(firstPage, firstPlayers.length);
    const totalPages = extractTotalPages(firstPage);

    if (totalPages <= 1) {
      return { players: firstPlayers, total };
    }

    const pagesToFetch = Array.from({ length: totalPages - 1 }, (_, idx) => idx + 2);
    const pageResponses = await Promise.all(
      pagesToFetch.map((page) => searchPlayers({ filter, page, text })),
    );

    const combinedPlayers = mergeUniquePlayers([
      ...firstPlayers,
      ...pageResponses.flatMap((response) => getPlayersFromResponse(response)),
    ]);

    return {
      players: combinedPlayers,
      total: Math.max(total, combinedPlayers.length),
    };
  };

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setError('Ingresa un término de búsqueda.');
      setResults([]);
      setTotal(null);
      return;
    }

    try {
      setHasSearched(true);
      setIsLoading(true);
      setError(null);
      const normalizedQuery = searchOption === 'id' ? trimmed.replace(/\s+/g, '') : trimmed;
      let { players, total: totalPlayers } = await searchPlayersAllPages(searchOption, normalizedQuery);

      if (searchOption === 'name' && players.length === 0) {
        try {
          const usernameSearch = await searchPlayersAllPages('username', normalizedQuery);
          players = usernameSearch.players;
          totalPlayers = usernameSearch.total;
        } catch {
          // silently ignore fallback errors and keep empty result
        }
      }

      if (searchOption === 'id' && players.length === 0) {
        const idFallbackFilters: Array<'playerId' | 'userId'> = ['playerId', 'userId'];
        for (const filter of idFallbackFilters) {
          try {
            const fallbackSearch = await searchPlayersAllPages(filter, normalizedQuery);
            if (fallbackSearch.players.length > 0) {
              players = fallbackSearch.players;
              totalPlayers = fallbackSearch.total;
              break;
            }
          } catch {
            // keep trying next fallback filter
          }
        }
      }

      setResults(players);
      setTotal(totalPlayers);
    } catch (err) {
      setError('No se pudo obtener resultados.');
      setResults([]);
      setTotal(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />
      
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Buscar Jugador</h1>
            <p className="text-muted-foreground">Busca jugadores por grupo, ID, nombre o email</p>
          </div>

          {/* Search Card */}
          <Card className="hover-elevate">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <select
                  value={searchOption}
                  onChange={(e) => setSearchOption(e.target.value as 'group' | 'id' | 'name' | 'email')}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary md:w-48"
                >
                  <option value="group">Por Grupo</option>
                  <option value="id">Por ID Jugador</option>
                  <option value="name">Por Nombre</option>
                  <option value="email">Por Email</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Ingresa el término de búsqueda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <Button
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  <Search className="w-4 h-4" />
                  {isLoading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
              {error}
            </div>
          )}

          {hasSearched && results.length > 0 ? (
            <Card className="hover-elevate">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <p className="text-sm text-muted-foreground">
                    Resultados: <span className="font-semibold text-foreground">{total ?? results.length}</span>
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Nombre</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Grupo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((player, idx) => (
                        <tr key={player?.id ?? player?.playerId ?? idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                            {player?.id ?? player?.playerId ?? '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {player?.name ?? player?.playerName ?? player?.username ?? player?.userName ?? '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {player?.email ?? '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {player?.group ?? player?.groupName ?? '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground text-lg">No data found</p>
                <p className="text-muted-foreground">No players found</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground text-lg">Ingresa un término y presiona Buscar</p>
                <p className="text-muted-foreground">Selecciona un filtro para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BuscarJugador;