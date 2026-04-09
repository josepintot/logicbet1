import { useEffect, useState } from "react";

const API_BASE_URL = "https://sports-admin-server.jbets.online";

export function usePlatformAuthFetch(userId: string) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Login para obtener el token
        const loginRes = await fetch(`${API_BASE_URL}/v1/user/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: "JorgeConquer",
            password: "L4nho1q6CRB5WDn65Hf",
          }),
        });
        if (!loginRes.ok) throw new Error("Error autenticando usuario");
        const loginData = await loginRes.json();
        const token = loginData.message?.accessToken;
        if (!token) throw new Error("No se recibió token");
        localStorage.setItem("platformToken", token);

        // 2. Petición al endpoint de plataformas
        const platformsRes = await fetch(
          `${API_BASE_URL}/v1/platform/get_user_platforms?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!platformsRes.ok) throw new Error("Error obteniendo plataformas");
        const data = await platformsRes.json();
        setPlatforms(data.message || []);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  return { platforms, loading, error };
}
