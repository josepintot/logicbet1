import React, { useEffect, useMemo, useState } from 'react';
import { Search, X, Monitor, Activity, User, Hash, Gamepad2, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';
import { fetchUserPlatforms } from '@/lib/platformsApi';
import { fetchTickets, type TicketRow } from '@/lib/betsApi';

const USER_ID = '67ad2a78849373c6e62620be';
const ESTADOS = [
  'Todos los Estados',
  'Pending- 0',
  'Won- 1',
  'Lost- 2',
  'Cashout- 3',
  'Cancelled- 4',
];

type PlatformOption = {
  platformId: string;
  name: string;
};

const ApuestasPage: React.FC = () => {
  const [plataforma, setPlataforma] = useState('');
  const [estado, setEstado] = useState('Todos los Estados');
  const [idJugador, setIdJugador] = useState('');
  const [idTicket, setIdTicket] = useState('');
  const [idJuego, setIdJuego] = useState('');
  const [idEvento, setIdEvento] = useState('');
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(true);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchUserPlatforms(USER_ID)
      .then((rows) => {
        if (!isMounted) return;

        const nextPlatforms = rows
          .map((row) => ({
            platformId: String(row?.platformId ?? '').trim(),
            name: String(row?.name ?? '').trim(),
          }))
          .filter((row) => row.platformId && row.name);

        setPlatforms(nextPlatforms);
        setPlatformsLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        setPlatformsError(error instanceof Error ? error.message : 'No se pudieron cargar las plataformas');
        setPlatformsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const platformNamesById = useMemo(() => {
    return platforms.reduce<Record<string, string>>((acc, platform) => {
      acc[platform.platformId] = platform.name;
      acc[platform.platformId.toLowerCase()] = platform.name;
      return acc;
    }, {});
  }, [platforms]);

  const ticketFilters = useMemo(() => ({
    userId: USER_ID,
    ...(plataforma ? { platformId: plataforma } : {}),
    ...(estado !== 'Todos los Estados' ? { status: estado } : {}),
    ...(idJugador.trim() ? { playerId: idJugador.trim() } : {}),
    ...(idTicket.trim() ? { ticketId: idTicket.trim() } : {}),
    ...(idJuego.trim() ? { gameId: idJuego.trim() } : {}),
    ...(idEvento.trim() ? { eventId: idEvento.trim() } : {}),
  }), [plataforma, estado, idJugador, idTicket, idJuego, idEvento]);

  const handleClearFilters = () => {
    setPlataforma('');
    setEstado('Todos los Estados');
    setIdJugador('');
    setIdTicket('');
    setIdJuego('');
    setIdEvento('');
    setTickets([]);
    setTicketsError(null);
    setHasSearched(false);
  };

  const handleSearch = async () => {
    setTicketsLoading(true);
    setTicketsError(null);
    setHasSearched(true);

    try {
      const rows = await fetchTickets(ticketFilters, platformNamesById);

      setTickets(rows);
    } catch (error) {
      setTickets([]);
      setTicketsError(error instanceof Error ? error.message : 'No se pudieron cargar los tickets');
    } finally {
      setTicketsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />

      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Apuestas</h1>
            <p className="text-muted-foreground text-sm">Consulta y filtra los tickets de apuestas</p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#0B132B]">Filtros</h2>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearFilters}
                  className="gap-2 bg-red-500 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                  Limpiar Filtros
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-[#2664EC]" /> Plataformas
                  </label>
                  <div className="relative">
                    <select
                      value={plataforma}
                      onChange={(e) => setPlataforma(e.target.value)}
                      disabled={platformsLoading}
                      className="w-full appearance-none px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#2664EC] text-sm pr-8 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {platformsLoading ? 'Cargando plataformas...' : 'Todas las Plataformas'}
                      </option>
                      {platforms.map((platform) => (
                        <option key={platform.platformId} value={platform.platformId}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      ▼
                    </span>
                  </div>
                  {platformsError && <p className="text-xs text-red-500">{platformsError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#2664EC]" /> Estado
                  </label>
                  <div className="relative">
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#2664EC] text-sm pr-8"
                    >
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      ▼
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2664EC]" /> ID Jugador
                  </label>
                  <input
                    type="text"
                    value={idJugador}
                    onChange={(e) => setIdJugador(e.target.value)}
                    placeholder="ID Jugador"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2664EC] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#2664EC]" /> ID Ticket
                  </label>
                  <input
                    type="text"
                    value={idTicket}
                    onChange={(e) => setIdTicket(e.target.value)}
                    placeholder="ID Ticket"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2664EC] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#2664EC]" /> ID de Juego
                  </label>
                  <input
                    type="text"
                    value={idJuego}
                    onChange={(e) => setIdJuego(e.target.value)}
                    placeholder="ID de Juego"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2664EC] text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#2664EC]" /> ID del Evento
                  </label>
                  <input
                    type="text"
                    value={idEvento}
                    onChange={(e) => setIdEvento(e.target.value)}
                    placeholder="ID del Evento"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#2664EC] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2664EC]" /> Rango de Fechas
                  </label>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background cursor-pointer hover:border-[#2664EC] transition-colors">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#2664EC] to-[#00B4D8] flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-[#0B132B]">Seleccionar rango</p>
                      <p className="text-xs text-muted-foreground">Desde - Hasta</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleSearch}
                  disabled={ticketsLoading}
                  className="gap-2 px-10 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-[#2664EC] to-[#00B4D8] text-white hover:opacity-90 transition-opacity shadow-md disabled:opacity-70"
                >
                  <Search className="w-4 h-4" />
                  {ticketsLoading ? 'BUSCANDO...' : 'BUSCAR TICKETS'}
                </Button>
              </div>

            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0B132B]">Filtro Multiple de Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ticketsError && <p className="px-4 py-4 text-sm text-red-500">{ticketsError}</p>}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">ID Ticket</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Plataforma</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Security Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">ID Jugador</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Apuesta</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ganancia Potencial</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Tracking</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Acciones</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Detalles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((row, idx) => (
                      <tr key={`${row.idTicket}-${idx}`} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.idTicket}</td>
                        <td className="px-4 py-3">{row.plataforma}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{row.fecha}</td>
                        <td className="px-4 py-3 font-mono text-xs">{row.securityCode}</td>
                        <td className="px-4 py-3">{row.tipo}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.idJugador}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#2664EC]/10 px-2.5 py-0.5 text-xs font-semibold text-[#2664EC]">
                            {row.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#0B132B]">{row.apuesta}</td>
                        <td className="px-4 py-3 font-semibold text-[#00B4D8]">{row.gananciaPotencial}</td>
                        <td className="px-4 py-3">{row.tracking}</td>
                        <td className="px-4 py-3">{row.acciones}</td>
                        <td className="px-4 py-3">{row.detalles}</td>
                      </tr>
                    ))}

                    {!ticketsLoading && !ticketsError && !tickets.length && (
                      <tr>
                        <td colSpan={12} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          {hasSearched ? 'No se encontraron tickets con esos filtros.' : 'Selecciona filtros y presiona Buscar Tickets.'}
                        </td>
                      </tr>
                    )}

                    {ticketsLoading && (
                      <tr>
                        <td colSpan={12} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          Cargando tickets...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ApuestasPage;
