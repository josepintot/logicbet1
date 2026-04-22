import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';

const PLATFORMS_OPTIONS = ['Plataformas', 'Platform A', 'Platform B'];

const ReportesPorJugador: React.FC = () => {
  const [playerId, setPlayerId] = useState('');
  const [platform, setPlatform] = useState('Plataformas');

  // Date range — current month
  const dateLabel = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) =>
      d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    return {
      range: `${fmt(start)} – ${fmt(end)}`,
      days: end.getDate(),
    };
  }, []);

  const handleSearch = () => {
    // TODO: connect to endpoint
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />

      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Reportes</h1>
            <p className="text-muted-foreground text-sm">Visualiza los reportes por jugador</p>
          </div>

          {/* Filter bar */}
          <div className="rounded-2xl bg-[#EEF4FF] p-5">
            <p className="text-base font-bold text-[#0B132B] mb-4">Reportes por Jugador</p>
            <div className="flex flex-wrap items-center gap-3">

              {/* Player ID input */}
              <input
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                placeholder="Player Id"
                className="pl-3 pr-3 py-2.5 rounded-lg border border-[#D0DCFF] bg-white text-[#0B132B] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2664EC] min-w-[160px]"
              />

              {/* Platforms dropdown */}
              <div className="relative">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-[#D0DCFF] bg-white text-[#0B132B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2664EC] min-w-[180px]"
                >
                  {PLATFORMS_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>

              {/* Date picker pill */}
              <button className="flex items-center gap-3 bg-white border border-[#D0DCFF] rounded-xl px-3 py-2 hover:border-[#2664EC] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2664EC] to-[#00B4D8] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#0B132B] leading-tight">{dateLabel.range}</p>
                  <p className="text-xs text-muted-foreground">{dateLabel.days} Días seleccionados</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
              </button>

              {/* Search button */}
              <Button
                onClick={handleSearch}
                className="gap-2 px-5 py-2.5 rounded-lg bg-[#00B4D8] hover:bg-[#009bbf] text-white font-semibold text-sm"
              >
                <Search className="w-4 h-4" />
                Buscar
              </Button>

            </div>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">No data found</p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ReportesPorJugador;
