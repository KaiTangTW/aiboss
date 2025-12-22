import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TimerHistory, InsertTimerHistory } from "@shared/schema";

export function useTimerHistory() {
  return useQuery<TimerHistory[]>({
    queryKey: ["/api/history"],
  });
}

export function useTimerStats() {
  return useQuery<{ totalTime: number; sessionCount: number; todayTime: number }>({
    queryKey: ["/api/history/stats"],
  });
}

export function useCreateHistory() {
  return useMutation({
    mutationFn: async (history: InsertTimerHistory) => {
      const res = await apiRequest("POST", "/api/history", history);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history/stats"] });
    },
  });
}
