/** Standard paginated API response shape: { items, total, offset, limit } */
export interface PaginatedResponse<T> {
  items: T[];
  total?: number;
}

export function extractPaginatedItems(
  data: { items?: unknown[]; data?: unknown[] } | unknown[],
  fallback: unknown[] = []
): unknown[] {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return fallback;
}

export function extractTotal(data: Record<string, unknown> | null): number | undefined {
  if (!data) return undefined;
  const t = data.total ?? data.total_count;
  return typeof t === 'number' ? t : undefined;
}
