import { useQuery } from "@tanstack/react-query";

export interface Platform {
  userId: string;
  platformId: string;
  name: string;
  template: string;
  walletUrl: string;
  active: boolean;
}

async function fetchPlatforms(userId: string): Promise<Platform[]> {
  const res = await fetch(
    `https://sports-admin-server.jbets.online/v1/platform/get_user_platforms?userId=${userId}`
  );
  if (!res.ok) throw new Error("Error fetching platforms");
  const data = await res.json();
  // Ajustar según la estructura real de la respuesta
  return data.message || [];
}

export function usePlatforms(userId: string) {
  return useQuery({
    queryKey: ["platforms", userId],
    queryFn: () => fetchPlatforms(userId),
  });
}
