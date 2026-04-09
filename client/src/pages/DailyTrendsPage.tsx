import { useMemo } from "react";
import { DailyTrends } from "@/components/DailyTrends";

// Mock data - reemplaza esto cuando tengas el endpoint real
const MOCK_DAILY_DATA = {
  PYG: [
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
  ],
};

export default function DailyTrendsPage() {
  const currencyData = useMemo(() => {
    return MOCK_DAILY_DATA.PYG;
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border sticky top-0 bg-background z-50">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-light text-primary">Análisis de Tendencias</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 md:px-16 lg:px-24 py-8">
        <div className="max-w-7xl mx-auto">
          <DailyTrends
            currency="PYG"
            data={currencyData}
            currencySymbol="₧"
          />
        </div>
      </main>
    </div>
  );
}
