import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  LogOut, 
  Menu, 
  Home, 
  Monitor, 
  Users, 
  Search, 
  TrendingUp,
  Trophy,
  UserCheck,
  DollarSign,
  Calendar as CalendarIcon,
  ChevronDown,
  Loader2,
  X
} from "lucide-react";
import logoImage from "@assets/generated_images/Logic_Bet_minimal_logo_14ce3d7c.png";
import { FinancialMetricsCard } from "@/components/FinancialMetricsCard";
import { DailyTrends } from "@/components/DailyTrends";
import { useFinancialReport } from "@/hooks/useFinancialReport";
import { useActivePlayers } from "@/hooks/useActivePlayers";
import { getMonthYearShort } from "@/lib/financialReportApi";

// Mock data para tendencias diarias
const MOCK_DAILY_TRENDS_PYG = [
  {
    date: "mie. 25 de 2025",
    totalBet: 25000,
    totalWin: 0,
    totalCashout: 25000,
    netWin: 0,
  },
  {
    date: "jue. 27 de 2025",
    totalBet: 128600,
    totalWin: 52300,
    totalCashout: 0,
    netWin: 52300,
  },
  {
    date: "mie. 08 de 2025",
    totalBet: 150000,
    totalWin: 54200,
    totalCashout: 0,
    netWin: 54200,
  },
  {
    date: "lun. 29 de 2025",
    totalBet: 100000,
    totalWin: 0,
    totalCashout: 0,
    netWin: 0,
  },
  {
    date: "lun. 24 de 2025",
    totalBet: 100000,
    totalWin: 0,
    totalCashout: 0,
    netWin: 0,
  },
  {
    date: "vie. 17 de 2025",
    totalBet: 20000,
    totalWin: 0,
    totalCashout: 0,
    netWin: 0,
  },
  {
    date: "mié. 15 de 2025",
    totalBet: 950000,
    totalWin: 1205889,
    totalCashout: 0,
    netWin: -755889,
  },
];

export default function Dashboard() {
  const [selectedDateRange, setSelectedDateRange] = useState("31 Dec - 29 Jan");
  const [daysSelected, setDaysSelected] = useState(30);
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: new Date(2025, 11, 31),
    to: new Date(2026, 0, 29),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch financial report data
  const { data: reportData, isLoading, error } = useFinancialReport({
    userId: "67ad2a78849373c6e62620be",
    startDate: "2025-12-31T00:00:00.000Z",
    endDate: "2026-01-29T23:59:59.999Z",
  });

  // Fetch active players data
  const { data: activePlayers, isLoading: isLoadingPlayers, error: playersError } = useActivePlayers();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const formatDateRange = (start: Date | undefined, end: Date | undefined) => {
    if (!start || !end) return "Select date range";
    const startStr = start.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const endStr = end.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const handleApplyDateRange = () => {
    if (dateRange.from && dateRange.to) {
      setSelectedDateRange(formatDateRange(dateRange.from, dateRange.to));
      // Calculate days difference
      const timeDiff = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      setDaysSelected(daysDiff);
      setIsOpen(false);
    }
  };

  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const menuItems = [
    { icon: Home, label: "Home", key: "home" },
    { icon: Monitor, label: "Platforms", key: "platforms" },
    { 
      icon: Users, 
      label: "Players", 
      key: "players",
      submenu: [
        { label: "Buscar Jugador", key: "buscar-jugador", href: "/players/buscar-jugador" },
        { label: "Más Apostadores", key: "mas-apostadores", href: "/players/mas-apostadores" },
        { label: "Más Ganadores", key: "mas-ganadores", href: "/players/mas-ganadores" },
        { label: "Jugadores Activos", key: "jugadores-activos", href: "/players/jugadores-activos" },
      ]
    },
    { icon: DollarSign, label: "Bets", key: "bets" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border sticky top-0 bg-background z-40">
        <div className="px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              data-testid="button-menu-sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <img src={logoImage} alt="Logic Bet" className="h-12 w-auto object-contain" data-testid="img-logo-dashboard" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu - Popup */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 shadow-lg">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedMenu === item.key;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                
                return (
                  <div key={item.key}>
                    <button
                      data-testid={`menu-item-${item.key}`}
                      onClick={() => {
                        if (hasSubmenu) {
                          setExpandedMenu(isExpanded ? null : item.key);
                        } else {
                          setIsMenuOpen(false);
                          if (item.key === "platforms") {
                            window.location.href = "/plataformas";
                          }
                        }
                      }}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {hasSubmenu && (
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>

                    {hasSubmenu && isExpanded && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-primary/30 pl-4">
                        {item.submenu.map((subitem) => (
                          <button
                            key={subitem.key}
                            onClick={() => {
                              setIsMenuOpen(false);
                              window.location.href = subitem.href;
                            }}
                            className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            {subitem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Date Range Selector */}
          <Card className="hover-elevate" data-testid="card-date-selector">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="font-medium" data-testid="text-date-range">{selectedDateRange}</p>
                  <p className="text-xs text-muted-foreground">{daysSelected} Days Selected</p>
                </div>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-6 space-y-4">
                      {/* Header with date display */}
                      <div className="text-center border-b pb-4">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Seleccionar rango de fechas</p>
                        <p className="text-base font-medium">
                          {dateRange.from && dateRange.to 
                            ? formatDateRange(dateRange.from, dateRange.to)
                            : "Select dates"}
                        </p>
                      </div>

                      {/* Single Calendar with Range Selection */}
                      <div className="flex justify-center">
                        <Calendar
                          mode="range"
                          selected={{
                            from: dateRange.from,
                            to: dateRange.to,
                          }}
                          onSelect={(range) => {
                            if (range?.from) {
                              setDateRange({
                                from: range.from,
                                to: range.to || range.from,
                              });
                            }
                          }}
                          disabled={(date) =>
                            date > new Date(2026, 3, 30) || date < new Date(2026, 0, 1)
                          }
                          numberOfMonths={2}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setIsOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          className="flex-1 bg-primary"
                          onClick={handleApplyDateRange}
                        >
                          Aceptar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Financial Report Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-primary flex items-center justify-center gap-3" data-testid="heading-financial-report">
              <TrendingUp className="w-8 h-8" />
              <span>Financial Report</span>
            </h1>
            <p className="text-muted-foreground">Metrics by Currency</p>
          </div>

          {/* Summary Section */}
          <Card data-testid="card-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Currencies */}
                <div className="text-center space-y-2" data-testid="metric-total-currencies">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide text-center">Total Currencies</p>
                  <p className="text-4xl font-light text-center" data-testid="value-total-currencies">6</p>
                </div>

                {/* Reported Months */}
                <div className="text-center space-y-2" data-testid="metric-reported-months">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide text-center">Reported Months</p>
                  <p className="text-4xl font-light text-center" data-testid="value-reported-months">2</p>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-elevate" data-testid="card-active-users">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Active Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingPlayers ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : playersError ? (
                  <div>
                    <p className="text-3xl font-light text-red-600" data-testid="value-active-players">Error</p>
                    <p className="text-sm text-red-600 mt-1">Failed to load data</p>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-light" data-testid="value-active-players">
                      {activePlayers?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Currently active</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-total-bets">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Total Bets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-light" data-testid="value-total-bets">$45,678</p>
                <p className="text-sm text-muted-foreground mt-1">This period</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Metrics by Currency and Month */}
          <div className="space-y-8">
            {/* Mostrar Dec 2025 y Jan 2026 lado a lado */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tabla Dec 2025 */}
                <div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading financial data...</span>
                    </div>
                  ) : error ? (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                      <CardContent className="p-6">
                        <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                          Error loading financial data
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-950/40 p-3 rounded overflow-auto max-h-32">
                          {error instanceof Error ? error.message : "Unknown error occurred"}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Check the browser console for more details
                        </p>
                      </CardContent>
                    </Card>
                  ) : reportData?.message ? (
                    <>
                      {Object.entries(reportData.message).map(([currency, monthsData]) => {
                        const decData = monthsData.find((m) => m.month === "2025-12");
                        return decData ? (
                          <div key={currency + "-dec"} className="space-y-4">
                            <h3 className="text-lg font-medium text-muted-foreground">
                              {currency === "ARS" && "Argentine Peso (ARS)"}
                              {currency === "USD" && "US Dollar (USD)"}
                              {currency === "PEN" && "Peruvian Sol (PEN)"}
                              {currency === "CLP" && "Chilean Peso (CLP)"}
                              {currency === "MXN" && "Mexican Peso (MXN)"}
                              {currency === "PYG" && "Paraguayan Guarani (PYG)"}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <FinancialMetricsCard
                                key={`${currency}-2025-12`}
                                month={"Dec"}
                                currency={currency}
                                data={decData}
                                isPrimaryMetric={true}
                              />
                            </div>
                          </div>
                        ) : null;
                      })}
                    </>
                  ) : null}
                </div>
                {/* Tabla Jan 2026 */}
                <div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading financial data...</span>
                    </div>
                  ) : error ? (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                      <CardContent className="p-6">
                        <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                          Error loading financial data
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-950/40 p-3 rounded overflow-auto max-h-32">
                          {error instanceof Error ? error.message : "Unknown error occurred"}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Check the browser console for more details
                        </p>
                      </CardContent>
                    </Card>
                  ) : reportData?.message ? (
                    <>
                      {Object.entries(reportData.message).map(([currency, monthsData]) => {
                        const janData = monthsData.find((m) => m.month === "2026-01");
                        return janData ? (
                          <div key={currency + "-jan"} className="space-y-4">
                            <h3 className="text-lg font-medium text-muted-foreground">
                              {currency === "ARS" && "Argentine Peso (ARS)"}
                              {currency === "USD" && "US Dollar (USD)"}
                              {currency === "PEN" && "Peruvian Sol (PEN)"}
                              {currency === "CLP" && "Chilean Peso (CLP)"}
                              {currency === "MXN" && "Mexican Peso (MXN)"}
                              {currency === "PYG" && "Paraguayan Guarani (PYG)"}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              <FinancialMetricsCard
                                key={`${currency}-2026-01`}
                                month={"Jan"}
                                currency={currency}
                                data={janData}
                                isPrimaryMetric={true}
                              />
                            </div>
                          </div>
                        ) : null;
                      })}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Trends Section */}
          <div className="space-y-8 mt-12 pt-8 border-t border-border">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light tracking-tight text-primary flex items-center justify-center gap-3">
                <TrendingUp className="w-6 h-6" />
                <span>Tendencias Diarias (Daily Trends)</span>
              </h2>
              <p className="text-muted-foreground">Daily performance metrics for Paraguayan Guarani (PYG)</p>
            </div>
            <DailyTrends 
              currency="PYG" 
              data={MOCK_DAILY_TRENDS_PYG}
              currencySymbol="₲"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
