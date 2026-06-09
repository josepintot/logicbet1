import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarMenu } from '@/components/SidebarMenu';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiUser {
  _id: string;
  userName: string;
  role: string;
  active: boolean;
}

interface ApiPlatform {
  _id: string;
  name: string;
}

interface PlatformReportRow {
  _id: string; // currency
  totalBetAmount: number;
  totalVatAmount: number;
  totalWin: number;
  totalWinAfterVat: number;
  totalCashoutAmount: number;
  totalCashoutVatAmount: number;
  totalCashoutAfterVat: number;
  ticketsQty: number;
}

interface PlatformSection {
  platformId: string;
  platformName: string;
  rows: PlatformReportRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(value: number): string {
  return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function netTotal(row: PlatformReportRow): number {
  return row.totalBetAmount - row.totalWinAfterVat - row.totalCashoutAfterVat;
}

// ─── Table component ──────────────────────────────────────────────────────────

const COL_HEADERS = ['MONEDA', 'APOSTADO', 'GANADO', 'TICKETS', 'CASHOUT', 'VAT', 'TOTAL'];

const TableHeader: React.FC = () => (
  <tr className="border-b border-slate-200">
    {COL_HEADERS.map((h) => (
      <th
        key={h}
        className={`px-4 py-2 text-xs font-semibold text-[#2664EC] tracking-wide ${h === 'MONEDA' ? 'text-left' : 'text-right'}`}
      >
        {h}
      </th>
    ))}
  </tr>
);

const DataRow: React.FC<{ row: PlatformReportRow }> = ({ row }) => {
  const total = netTotal(row);
  const vat = row.totalVatAmount + row.totalCashoutVatAmount;
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-4 py-2 text-sm font-medium text-slate-700">{row._id}</td>
      <td className="px-4 py-2 text-sm text-right text-slate-600">{fmtNum(row.totalBetAmount)}</td>
      <td className="px-4 py-2 text-sm text-right text-slate-600">{fmtNum(row.totalWinAfterVat)}</td>
      <td className="px-4 py-2 text-sm text-right text-slate-600">{row.ticketsQty}</td>
      <td className="px-4 py-2 text-sm text-right text-slate-600">{fmtNum(row.totalCashoutAfterVat)}</td>
      <td className="px-4 py-2 text-sm text-right text-slate-600">{fmtNum(vat)}</td>
      <td className={`px-4 py-2 text-sm text-right font-semibold ${total >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {fmtNum(total)}
      </td>
    </tr>
  );
};

const EmptyRows: React.FC = () => (
  <tr>
    <td colSpan={7} className="px-4 py-6 text-center text-xs text-slate-400">
      <FileText className="inline w-4 h-4 mb-1 mr-1 opacity-40" />
      No data found
    </td>
  </tr>
);

// ─── Main component ───────────────────────────────────────────────────────────

const ReporteGeneral: React.FC = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [sections, setSections] = useState<PlatformSection[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => {
        const list: ApiUser[] = Array.isArray(data?.message) ? data.message : [];
        const filtered = list.filter((u) => u.active && (u.role === 'user' || u.role === 'agent'));
        setUsers(filtered);
        if (filtered.length > 0) setSelectedUserId(filtered[0]._id);
      })
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, []);

  // Date range — current month
  const dateInfo = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    return {
      range: `${fmt(start)} – ${fmt(end)}`,
      days: end.getDate(),
      startDateIso: `${start.toISOString().split('T')[0]}T00:00:00.000Z`,
      endDateIso: `${end.toISOString().split('T')[0]}T23:59:59.999Z`,
    };
  }, []);

  const handleSearch = useCallback(async () => {
    if (!selectedUserId) return;
    setIsSearching(true);
    setSearchError(null);
    setSections(null);

    try {
      // 1. Fetch platforms for this user
      const platformsResp = await fetch(`/api/platforms?userId=${selectedUserId}`);
      const platformsData = await platformsResp.json();
      const platforms: ApiPlatform[] = Array.isArray(platformsData?.message)
        ? platformsData.message
        : [];

      // 2. Fetch per-platform report in parallel
      const results = await Promise.allSettled(
        platforms.map(async (p) => {
          const url = `/api/platform-report?userId=${selectedUserId}&platformId=${p._id}&startDate=${dateInfo.startDateIso}&endDate=${dateInfo.endDateIso}`;
          const resp = await fetch(url);
          const json = await resp.json();
          const rows: PlatformReportRow[] = Array.isArray(json?.message) ? json.message : [];
          return { platformId: p._id, platformName: p.name, rows };
        }),
      );

      const resolved: PlatformSection[] = results
        .filter((r): r is PromiseFulfilledResult<PlatformSection> => r.status === 'fulfilled')
        .map((r) => r.value);

      setSections(resolved);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSearching(false);
    }
  }, [selectedUserId, dateInfo]);

  // Build summary: aggregate all platform rows by currency
  const summaryRows = useMemo<PlatformReportRow[]>(() => {
    if (!sections) return [];
    const map = new Map<string, PlatformReportRow>();
    for (const section of sections) {
      for (const row of section.rows) {
        const existing = map.get(row._id);
        if (!existing) {
          map.set(row._id, { ...row });
        } else {
          map.set(row._id, {
            _id: row._id,
            totalBetAmount: existing.totalBetAmount + row.totalBetAmount,
            totalVatAmount: existing.totalVatAmount + row.totalVatAmount,
            totalWin: existing.totalWin + row.totalWin,
            totalWinAfterVat: existing.totalWinAfterVat + row.totalWinAfterVat,
            totalCashoutAmount: existing.totalCashoutAmount + row.totalCashoutAmount,
            totalCashoutVatAmount: existing.totalCashoutVatAmount + row.totalCashoutVatAmount,
            totalCashoutAfterVat: existing.totalCashoutAfterVat + row.totalCashoutAfterVat,
            ticketsQty: existing.ticketsQty + row.ticketsQty,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a._id.localeCompare(b._id));
  }, [sections]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />

      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Reportes</h1>
            <p className="text-muted-foreground text-sm">Visualiza los reportes generales de la plataforma</p>
          </div>

          {/* Filter bar */}
          <div className="rounded-2xl bg-[#EEF4FF] p-5">
            <p className="text-base font-bold text-[#0B132B] mb-4">Reporte General</p>
            <div className="flex flex-wrap items-center gap-3">

              {/* Users dropdown */}
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={usersLoading}
                  className="appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-[#D0DCFF] bg-white text-[#0B132B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2664EC] min-w-[240px] disabled:opacity-50"
                >
                  {usersLoading ? (
                    <option>Cargando usuarios...</option>
                  ) : (
                    users.map((u) => (
                      <option key={u._id} value={u._id}>
                        production - {u.role} - {u.userName}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>

              {/* Date pill */}
              <div className="flex items-center gap-3 bg-white border border-[#D0DCFF] rounded-xl px-3 py-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2664EC] to-[#00B4D8] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#0B132B] leading-tight">{dateInfo.range}</p>
                  <p className="text-xs text-muted-foreground">{dateInfo.days} Días seleccionados</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
              </div>

              {/* Search button */}
              <Button
                onClick={handleSearch}
                className="gap-2 px-5 py-2.5 rounded-lg bg-[#00B4D8] hover:bg-[#009bbf] text-white font-semibold text-sm"
                disabled={isSearching || usersLoading || !selectedUserId}
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isSearching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {/* Results */}
          {isSearching && (
            <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm font-medium">Cargando datos del reporte...</p>
            </div>
          )}

          {searchError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-700">Error al obtener el reporte</p>
              <p className="text-xs text-red-600 mt-1">{searchError}</p>
            </div>
          )}

          {sections && !isSearching && (
            <div className="rounded-2xl border border-[#D0DCFF] bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {/* Summary section */}
                  <thead>
                    <TableHeader />
                  </thead>
                  <tbody>
                    {summaryRows.length > 0 ? summaryRows.map((row) => (
                      <DataRow key={`summary-${row._id}`} row={row} />
                    )) : <EmptyRows />}
                  </tbody>

                  {/* Per-platform sections */}
                  {sections.map((section) => (
                    <React.Fragment key={section.platformId}>
                      <thead>
                        <tr className="bg-slate-50">
                          <td
                            colSpan={7}
                            className="px-4 py-2 text-sm font-semibold text-[#2664EC]"
                          >
                            {section.platformName}
                          </td>
                        </tr>
                        <TableHeader />
                      </thead>
                      <tbody>
                        {section.rows.length > 0 ? section.rows.map((row) => (
                          <DataRow key={`${section.platformId}-${row._id}`} row={row} />
                        )) : <EmptyRows />}
                      </tbody>
                    </React.Fragment>
                  ))}
                </table>
              </div>
            </div>
          )}

          {/* Initial empty state */}
          {!sections && !isSearching && !searchError && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">Selecciona un usuario y presiona Buscar</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ReporteGeneral;

