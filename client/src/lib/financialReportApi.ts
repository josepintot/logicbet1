export interface MonthlyReportData {
  totalBet: number;
  totalWinAfterVat: number;
  totalCashoutAfterVat: number;
  netWin: number;
  month: string;
}

export interface FinancialReportResponse {
  result: string;
  message: Record<string, MonthlyReportData[]>;
}

// Call API directly from frontend (browser) - Cloudflare allows browser requests
const API_BASE_URL = "https://sports-admin-server.jbets.online";

export async function fetchMonthlyReportStats(
  userId: string,
  startDate: string,
  endDate: string
): Promise<FinancialReportResponse> {
  // First, authenticate to get token
  const loginUrl = `${API_BASE_URL}/v1/user/login`;
  
  try {
    console.log("Authenticating with API...");
    const loginResponse = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName: "JorgeConquer",
        password: "L4nho1q6CRB5WDn65Hf",
      }),
    });

    if (!loginResponse.ok) {
      const errorBody = await loginResponse.text();
      console.error("Login failed:", loginResponse.status, errorBody);
      throw new Error(`Authentication failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log("Login response:", loginData);
    
    // Token is in message.accessToken
    const token = loginData.message?.accessToken;
    
    if (!token) {
      console.error("Full login response:", JSON.stringify(loginData, null, 2));
      throw new Error("No token received from API - check console for full response");
    }

    console.log("Authentication successful! Token:", token.substring(0, 20) + "...");

    // Now fetch the financial report
    const params = new URLSearchParams({
      userId,
      startDate,
      endDate,
    });

    const reportUrl = `${API_BASE_URL}/v1/report/get_monthly_report_stats?${params.toString()}`;
    console.log("Fetching report from:", reportUrl);

    const reportResponse = await fetch(reportUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Report response status:", reportResponse.status);

    if (!reportResponse.ok) {
      const errorBody = await reportResponse.text();
      console.error("Error response body:", errorBody);
      throw new Error(
        `Failed to fetch financial report: ${reportResponse.status} ${reportResponse.statusText}`
      );
    }

    const data: FinancialReportResponse = await reportResponse.json();
    console.log("Success! Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching financial report:", error);
    throw error;
  }
}

export function formatCurrency(value: number, currency: string): string {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

export function getMonthName(dateString: string): string {
  const date = new Date(dateString + "-01");
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

export function getMonthYearShort(dateString: string): string {
  const [year, month] = dateString.split("-");
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
}
