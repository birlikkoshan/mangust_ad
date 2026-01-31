export interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Items per page (used as limit) */
  limit: number;
  /** Total number of items (optional; if not provided, only Prev/Next are shown) */
  totalItems?: number;
  /** Called when page changes. Parent should refetch with offset = (page - 1) * limit */
  onPageChange: (page: number) => void;
  /** Called when limit (items per page) changes. Parent should reset to page 1 and refetch */
  onLimitChange?: (limit: number) => void;
  /** Options for items-per-page selector */
  limitOptions?: number[];
}

export default function Pagination({
  page,
  limit,
  totalItems,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const totalPages = totalItems != null && totalItems > 0 ? Math.ceil(totalItems / limit) : null;
  const startItem = totalItems != null && totalItems > 0 ? (page - 1) * limit + 1 : null;
  const endItem = totalItems != null && totalItems > 0 ? Math.min(page * limit, totalItems) : null;

  const canPrev = page > 1;
  const canNext =
    totalItems === 0 ? false : totalPages == null ? true : page < totalPages;

  const handlePrev = () => {
    if (canPrev) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (canNext) onPageChange(page + 1);
  };

  const maxVisiblePages = 5;
  const pageNumbers: number[] = [];
  if (totalPages != null) {
    let start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginTop: "20px",
        padding: "12px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {totalItems != null && (
          <span style={{ color: "#666", fontSize: "14px" }}>
            {totalItems === 0
              ? "No items"
              : `Showing ${startItem}–${endItem} of ${totalItems}`}
          </span>
        )}
        {onLimitChange && (
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "#666" }}>Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                fontSize: "14px",
              }}
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <button
          type="button"
          className="btn"
          onClick={handlePrev}
          disabled={!canPrev}
          style={{ padding: "6px 12px", minWidth: "36px" }}
        >
          Prev
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            className={n === page ? "btn btn-primary" : "btn"}
            onClick={() => onPageChange(n)}
            style={{ padding: "6px 12px", minWidth: "36px" }}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className="btn"
          onClick={handleNext}
          disabled={!canNext}
          style={{ padding: "6px 12px", minWidth: "36px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
