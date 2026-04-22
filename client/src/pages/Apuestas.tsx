import React, { useState } from 'react';
import { Search, Ticket, X, Monitor, Activity, User, Hash, Gamepad2, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';

// ─────────────────────────────────────────────
// TEST DATA — remove this block when real endpoints are ready
const TEST_ROWS = [
  {
    idTicket: 'TEST',
    plataforma: 'TEST',
    fecha: 'TEST',
    securityCode: 'TEST',
    tipo: 'TEST',
    idJugador: 'TEST',
    estado: 'TEST',
    apuesta: 'TEST',
    gananciaPotencial: 'TEST',
    tracking: 'TEST',
    acciones: 'TEST',
    detalles: 'TEST',
  },
];
// ─────────────────────────────────────────────

const ESTADOS = ['Todos los Estados', 'Activo', 'Ganado', 'Perdido', 'Cancelado', 'Pendiente'];

const ApuestasPage: React.FC = () => {
  const [plataforma, setPlataforma] = useState('');
  const [estado, setEstado] = useState('Todos los Estados');
  const [idJugador, setIdJugador] = useState('');
  const [idTicket, setIdTicket] = useState('');
  const [idJuego, setIdJuego] = useState('');
  const [idEvento, setIdEvento] = useState('');

  const handleClearFilters = () => {
    setPlataforma('');
    setEstado('Todos los Estados');
    setIdJugador('');
    setIdTicket('');
    setIdJuego('');
    setIdEvento('');
  };

  const handleSearch = () => {
    // TODO: connect to endpoint
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />

      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Apuestas</h1>
            <p className="text-muted-foreground text-sm">Consulta y filtra los tickets de apuestas</p>
          </div>

          {/* Filtros */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-6">
              {/* Title + Clear button */}
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

              {/* Row 1 — Plataformas · Estado · ID Jugador */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#0B132B] flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-[#2664EC]" /> Plataformas
                  </label>
                  <div className="relative">
                    <select
                      value={plataforma}
                      onChange={(e) => setPlataforma(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#2664EC] text-sm pr-8"
                    >
                      <option value="">Todas las Plataformas</option>
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▼</span>
                  </div>
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
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">▼</span>
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

              {/* Row 2 — ID Ticket · ID de Juego · ID del Evento */}
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

              {/* Row 3 — Rango de fechas (placeholder) */}
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
                      <p className="text-xs text-muted-foreground">Desde – Hasta</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search button */}
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleSearch}
                  className="gap-2 px-10 py-3 text-sm font-semibold rounded-full bg-gradient-to-r from-[#2664EC] to-[#00B4D8] text-white hover:opacity-90 transition-opacity shadow-md"
                >
                  <Search className="w-4 h-4" />
                  BUSCAR TICKETS
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0B132B]">Filtro Múltiple de Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                    {/* ── TEST ROW — remove TEST_ROWS and replace with real data from endpoint ── */}
                    {TEST_ROWS.map((row, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
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
                    {/* ── END TEST ROW ── */}
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
