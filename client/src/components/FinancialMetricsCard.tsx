import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { MonthlyReportData } from "@/lib/financialReportApi";

interface FinancialMetricsCardProps {
  month: string;
  currency: string;
  data: MonthlyReportData;
  isPrimaryMetric?: boolean;
}

export function FinancialMetricsCard({
  month,
  currency,
  data,
  isPrimaryMetric = false,
}: FinancialMetricsCardProps) {
  const isPositiveChange = data.netWin >= 0;
  const changeColor = isPositiveChange ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const borderColor = isPrimaryMetric ? "border-2 border-primary" : "border border-border";

  // Format numbers based on currency
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + "K";
    }
    return value.toFixed(2);
  };

  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      ARS: "$",
      USD: "$",
      PEN: "S/",
      CLP: "$",
      MXN: "$",
      PYG: "₧",
    };
    return symbols[curr] || curr;
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${borderColor} w-full md:min-w-[420px] md:max-w-[520px]`}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{month}</span>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">{currency}</span>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Columna 1: Total Apostado y Cashout */}
          <div className="space-y-4">
            {/* Total Bet */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Total Apostado
              </p>
              <p className="text-xl font-light text-foreground">
                {getCurrencySymbol(currency)}{formatValue(data.totalBet)}
              </p>
            </div>
            {/* Total Cashout After VAT */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Cashout Después de Impuestos
              </p>
              <p className="text-xl font-light text-foreground">
                {getCurrencySymbol(currency)}{formatValue(data.totalCashoutAfterVat)}
              </p>
            </div>
          </div>
          {/* Columna 2: Ganancia Después de Impuestos y Ganancia Neta */}
          <div className="space-y-4">
            {/* Total Win After VAT */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                Ganancia Después de Impuestos
              </p>
              <p className="text-xl font-light text-green-600 dark:text-green-400">
                {getCurrencySymbol(currency)}{formatValue(data.totalWinAfterVat)}
              </p>
            </div>
            {/* Net Win */}
            <div className="space-y-1 pt-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Ganancia Neta
              </p>
              <div className="flex items-center gap-2">
                <p className={`text-xl font-light ${changeColor}`}>
                  {getCurrencySymbol(currency)}{formatValue(Math.abs(data.netWin))}
                </p>
                {isPositiveChange ? (
                  <TrendingUp className={`w-4 h-4 ${changeColor}`} />
                ) : (
                  <TrendingDown className={`w-4 h-4 ${changeColor}`} />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
