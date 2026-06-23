import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import api from "./client";

// --- Generic hooks ---

export function useResource<T = unknown>(
  key: string | string[],
  path: string,
  options: Partial<UseQueryOptions<T>> = {},
) {
  return useQuery<T>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: () =>
      api.get(path).then((r) => {
        const d = r.data;
        if (d && !Array.isArray(d) && Array.isArray(d.results)) {
          return d.results as T;
        }
        return d as T;
      }),
    ...options,
  } as UseQueryOptions<T>);
}

export function useCreate<T = unknown>(
  path: string,
  invalidateKeys: string[] = [],
) {
  const qc = useQueryClient();
  return useMutation<T, Error, Record<string, unknown>>({
    mutationFn: (data) => api.post(path, data).then((r) => r.data),
    onSuccess: () =>
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export function useUpdate<T = unknown>(
  path: string,
  invalidateKeys: string[] = [],
) {
  const qc = useQueryClient();
  return useMutation<T, Error, Record<string, unknown>>({
    mutationFn: (data) => api.patch(path, data).then((r) => r.data),
    onSuccess: () =>
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

export function useDelete(path: string, invalidateKeys: string[] = []) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, void>({
    mutationFn: () => api.delete(path).then((r) => r.data),
    onSuccess: () =>
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })),
  });
}

// --- Domain-specific hooks ---

export function useSectors() {
  return useResource("sectors", "/sectors/");
}

export function useSector(id: string | number) {
  return useResource(["sector", String(id)], `/sectors/${id}/`);
}

export function useStocks() {
  return useResource("stocks", "/stocks/");
}

export function useStock(id: string | number) {
  return useResource(["stock", String(id)], `/stocks/${id}/`);
}

export function useHistoricals(stockId: string | number, options = {}) {
  return useResource(
    ["historicals", String(stockId)],
    `/historicals/?stock=${stockId}`,
    { enabled: !!stockId, ...options },
  );
}

export function useIncomes(stockId: string | number) {
  return useResource(
    ["incomes", String(stockId)],
    `/incomes/?stock=${stockId}`,
    {
      enabled: !!stockId,
    },
  );
}

export function useBalances(stockId: string | number) {
  return useResource(
    ["balances", String(stockId)],
    `/balances/?stock=${stockId}`,
    {
      enabled: !!stockId,
    },
  );
}

export function useCashes(stockId: string | number) {
  return useResource(["cashes", String(stockId)], `/cashes/?stock=${stockId}`, {
    enabled: !!stockId,
  });
}

export function useRatios(stockId: string | number) {
  return useResource(["ratios", String(stockId)], `/ratios/?stock=${stockId}`, {
    enabled: !!stockId,
  });
}

export function useRankings(type: string, params = "") {
  return useResource(["rankings", type, params], `/${type}-ranks/?${params}`);
}

export function useDiaries() {
  return useResource("diaries", "/diaries/");
}

export function useDiary(id: string | number) {
  return useResource(["diary", String(id)], `/diaries/${id}/`);
}

export function useNews() {
  return useResource("news", "/news/");
}

export function useTasks() {
  return useResource("tasks", "/tasks/", { refetchInterval: 5000 });
}

export function useInsiderTrades(stockId: string | number) {
  return useResource(
    ["insider-trades", String(stockId)],
    `/insider-trades/?stock=${stockId}`,
    { enabled: !!stockId },
  );
}

export function useHoldings(stockId: string | number) {
  return useResource(
    ["holdings", String(stockId)],
    `/holdings/?stock=${stockId}`,
    { enabled: !!stockId },
  );
}

export function useEarnings(stockId: string | number) {
  return useResource(
    ["earnings", String(stockId)],
    `/earnings/?stock=${stockId}`,
    { enabled: !!stockId },
  );
}

export function useMacroData(seriesId: string, dateGte?: string) {
  const params = dateGte ? `&date__gte=${dateGte}` : "";
  return useResource(
    ["macro-data", seriesId, dateGte || ""],
    `/macro-data/?series_id=${seriesId}${params}`,
    { enabled: !!seriesId },
  );
}

export function useStocksOverview(date?: string) {
  const params = date ? `?date=${date}` : "";
  return useResource(
    ["stocks-overview", date || "latest"],
    `/stocks/overview/${params}`,
  );
}

export function useStockHealth(stockId: string | number) {
  return useResource(
    ["stock-health", String(stockId)],
    `/stocks/${stockId}/health/`,
    { enabled: !!stockId },
  );
}
