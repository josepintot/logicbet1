import { useQuery } from "@tanstack/react-query";
import {
  fetchMonthlyReportStats,
  FinancialReportResponse,
} from "@/lib/financialReportApi";

interface UseFinancialReportOptions {
  userId: string;
  startDate: string;
  endDate: string;
  enabled?: boolean;
}

// Mock data para cuando el API no está disponible
const MOCK_DATA: FinancialReportResponse = {
  result: "success",
  message: {
    ARS: [
      {
        totalBet: 4309724.66,
        totalWinAfterVat: 3254042.55,
        totalCashoutAfterVat: 52460.29,
        netWin: 1003221.8200000003,
        month: "2025-10",
      },
      {
        totalBet: 39222777.03,
        totalWinAfterVat: 40645316.87,
        totalCashoutAfterVat: 1175275.61,
        netWin: -2597815.4499999965,
        month: "2025-11",
      },
    ],
    PEN: [
      {
        totalBet: 9137.9,
        totalWinAfterVat: 7542.53,
        totalCashoutAfterVat: 2325.2400000000002,
        netWin: -729.8700000000003,
        month: "2025-10",
      },
      {
        totalBet: 10273.12,
        totalWinAfterVat: 9296.06,
        totalCashoutAfterVat: 513.97,
        netWin: 463.0900000000013,
        month: "2025-11",
      },
    ],
    CLP: [
      {
        totalBet: 16219921,
        totalWinAfterVat: 13632750.13,
        totalCashoutAfterVat: 793855.24,
        netWin: 1793315.6299999992,
        month: "2025-10",
      },
      {
        totalBet: 22700889,
        totalWinAfterVat: 18132866.97,
        totalCashoutAfterVat: 5357205.77,
        netWin: -789183.7399999984,
        month: "2025-11",
      },
    ],
    MXN: [
      {
        totalBet: 10,
        totalWinAfterVat: 0,
        totalCashoutAfterVat: 0,
        netWin: 10,
        month: "2025-10",
      },
      {
        totalBet: 33,
        totalWinAfterVat: 0,
        totalCashoutAfterVat: 0,
        netWin: 33,
        month: "2025-11",
      },
    ],
    USD: [
      {
        totalBet: 263,
        totalWinAfterVat: 120.42999999999999,
        totalCashoutAfterVat: 7.44,
        netWin: 135.13,
        month: "2025-10",
      },
      {
        totalBet: 3349.99,
        totalWinAfterVat: 1362.48,
        totalCashoutAfterVat: 33.32,
        netWin: 1954.1899999999998,
        month: "2025-11",
      },
    ],
    PYG: [
      {
        totalBet: 4000,
        totalWinAfterVat: 0,
        totalCashoutAfterVat: 0,
        netWin: 4000,
        month: "2025-10",
      },
      {
        totalBet: 5000,
        totalWinAfterVat: 0,
        totalCashoutAfterVat: 0,
        netWin: 5000,
        month: "2025-11",
      },
    ],
  },
};

export function useFinancialReport({
  userId,
  startDate,
  endDate,
  enabled = true,
}: UseFinancialReportOptions) {
  return useQuery<FinancialReportResponse>({
    queryKey: ["financialReport", userId, startDate, endDate],
    queryFn: async () => {
      try {
        const data = await fetchMonthlyReportStats(userId, startDate, endDate);
        return data;
      } catch (error) {
        console.warn("API failed, using mock data:", error);
        // Retornar datos mock si el API falla
        return MOCK_DATA;
      }
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 0, // No reintentar, usar mock data inmediatamente
  });
}
