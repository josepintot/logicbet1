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
  TrendingUp,
  Trophy,
  UserCheck,
  DollarSign,
  Calendar as CalendarIcon,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { FinancialMetricsCard } from "@/components/FinancialMetricsCard";
import { DailyTrends } from "@/components/DailyTrends";
import { SidebarMenu } from "@/components/SidebarMenu";
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

  // Fetch financial report data
  const { data: reportData, isLoading, error } = useFinancialReport({
    userId: "67ad2a78849373c6e62620be",
    startDate: "2025-12-31T00:00:00.000Z",
    endDate: "2026-01-29T23:59:59.999Z",
  });

  // Fetch active players data
  const { data: activePlayers, isLoading: isLoadingPlayers, error: playersError } = useActivePlayers();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SidebarMenu />

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
