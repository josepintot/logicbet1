import { useQuery } from "@tanstack/react-query";
import { getActivePlayers } from "@/lib/playersApi";

export function useActivePlayers() {
  return useQuery({
    queryKey: ["activePlayers"],
    queryFn: getActivePlayers,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}
