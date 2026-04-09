import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface DailyTrendData {
  date: string;
  totalBet: number;
  totalWin: number;
  totalCashout: number;
  netWin: number;
}

interface DailyTrendsProps {
  currency: string;
  data: DailyTrendData[];
  currencySymbol?: string;
}

export function DailyTrends({
  currency,
  data,
  currencySymbol = "$",
}: DailyTrendsProps) {
  const [selectedDateRange, setSelectedDateRange] = useState("Últimos 30 días");

  // Calcular métricas
  const metrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalBet: 0,
        totalWin: 0,
        netWin: 0,
        avgDaily: 0,
      };
    }

    const totalBet = data.reduce((sum, d) => sum + d.totalBet, 0);
    const totalWin = data.reduce((sum, d) => sum + d.totalWin, 0);
    const netWin = data.reduce((sum, d) => sum + d.netWin, 0);
    const avgDaily = netWin / data.length;

    return {
      totalBet,
      totalWin,
      netWin,
      avgDaily,
    };
  }, [data]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + "K";
    }
    return value.toFixed(2);
  };

  const isPositive = metrics.netWin >= 0;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-primary">
            Tendencias Diarias - {currency}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{selectedDateRange}</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Apostados */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              Total Apostados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">
              {currencySymbol}
              {formatValue(metrics.totalBet)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Sumatoria de todas las apuestas
            </p>
          </CardContent>
        </Card>

        {/* Total Financiero */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              Total Financiero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light text-green-600 dark:text-green-400">
              {currencySymbol}
              {formatValue(metrics.totalWin)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ganancias después de impuestos
            </p>
          </CardContent>
        </Card>

        {/* Ganancia Neta */}
        <Card className="hover:shadow-lg transition-shadow border-2 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              Ganancia Neta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-light flex items-center gap-2 ${
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {currencySymbol}
              {formatValue(Math.abs(metrics.netWin))}
              {isPositive ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ganancia/Pérdida neta
            </p>
          </CardContent>
        </Card>

        {/* Promedio Diario */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              Promedio Diario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-light ${
                metrics.avgDaily >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {currencySymbol}
              {formatValue(metrics.avgDaily)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Promedio por día
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Tendencias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [
                  `${currencySymbol}${formatValue(value)}`,
                  "",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalBet"
                stroke="hsl(210, 100%, 50%)"
                name="Total Apostados"
                dot={{ r: 4 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="totalWin"
                stroke="hsl(142, 71%, 45%)"
                name="Total Financiero"
                dot={{ r: 4 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="netWin"
                stroke="hsl(0, 84%, 60%)"
                name="Ganancia Neta"
                dot={{ r: 4 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Fecha</TableHead>
                  <TableHead className="text-right">Total Apostados</TableHead>
                  <TableHead className="text-right">Total Financiero</TableHead>
                  <TableHead className="text-right">Total Cashout</TableHead>
                  <TableHead className="text-right">Ganancia Neta</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => {
                  const isWin = row.netWin >= 0;
                  return (
                    <TableRow key={index} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-sm">
                        {row.date}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {currencySymbol}
                        {formatValue(row.totalBet)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-green-600 dark:text-green-400">
                        {currencySymbol}
                        {formatValue(row.totalWin)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {currencySymbol}
                        {formatValue(row.totalCashout)}
                      </TableCell>
                      <TableCell
                        className={`text-right text-sm font-medium ${
                          isWin
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {currencySymbol}
                        {formatValue(Math.abs(row.netWin))}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isWin
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          }`}
                        >
                          {isWin ? "✓ Ganancia" : "✗ Pérdida"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
