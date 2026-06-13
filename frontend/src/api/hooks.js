import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "./client";

// --- Generic hooks ---

export function useResource(key, path, options = {}) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () => api.get(path).then((r) => r.data),
    ...options,
  });
}

export function useCreate(path, invalidateKeys = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(path, data).then((r) => r.data),
    onSuccess: () => invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export function useUpdate(path, invalidateKeys = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(path, data).then((r) => r.data),
    onSuccess: () => invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export function useDelete(path, invalidateKeys = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(path).then((r) => r.data),
    onSuccess: () => invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

// --- Domain-specific hooks ---

export function useSectors() {
  return useResource("sectors", "/sectors/");
}

export function useSector(id) {
  return useResource(["sector", id], `/sectors/${id}/`);
}

export function useStocks() {
  return useResource("stocks", "/stocks/");
}

export function useStock(id) {
  return useResource(["stock", id], `/stocks/${id}/`);
}

export function useHistoricals(stockId, options = {}) {
  return useResource(
    ["historicals", stockId],
    `/historicals/?stock=${stockId}`,
    { enabled: !!stockId, ...options },
  );
}

export function useIncomes(stockId) {
  return useResource(["incomes", stockId], `/incomes/?stock=${stockId}`, { enabled: !!stockId });
}

export function useBalances(stockId) {
  return useResource(["balances", stockId], `/balances/?stock=${stockId}`, { enabled: !!stockId });
}

export function useCashes(stockId) {
  return useResource(["cashes", stockId], `/cashes/?stock=${stockId}`, { enabled: !!stockId });
}

export function useRatios(stockId) {
  return useResource(["ratios", stockId], `/ratios/?stock=${stockId}`, { enabled: !!stockId });
}

export function useRankings(type, params = "") {
  return useResource(["rankings", type, params], `/${type}-ranks/?${params}`);
}

export function useDiaries() {
  return useResource("diaries", "/diaries/");
}

export function useDiary(id) {
  return useResource(["diary", id], `/diaries/${id}/`);
}

export function useNews() {
  return useResource("news", "/news/");
}

export function useTasks() {
  return useResource("tasks", "/tasks/", { refetchInterval: 5000 });
}
