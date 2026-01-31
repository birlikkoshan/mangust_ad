export interface PaginationProps {
  page: number;
  limit: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

const Pagination = ({
  page,
  limit,
  totalItems,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20, 50],
}: PaginationProps) => {
  // When total is missing, assume at least one page so the bar is visible
  const effectiveTotal = totalItems ?? 1;
  const pageCount = effectiveTotal > 0 ? Math.ceil(effectiveTotal / limit) : 1;
  const pageNumber = Math.max(0, Math.min(page - 1, pageCount - 1)); // 0-based, clamped

  const showPerPage = onLimitChange != null;
  const showPageNumbers = pageCount > 0;
  if (!showPerPage && !showPageNumbers) return null;
  if (!showPerPage && pageCount <= 1) return null;

  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push(
      <li key={i} className={`pagination-item ${pageNumber === i ? 'active' : ''}`}>
        <button type="button" className="pagination-link-btn" onClick={() => onPageChange(i + 1)}>
          {i + 1}
        </button>
      </li>
    );
  }

  const showEllipsis = pageCount > 5;
  const middleSlice = pages.slice(Math.max(1, pageNumber - 2), Math.min(pageCount - 1, pageNumber + 3));

  return (
    <div className="pagination-bar">
      {showPerPage && (
        <div className="pagination-per-page">
          <span className="pagination-per-page-label">Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="pagination-per-page-select"
          >
            {limitOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
      {showPageNumbers && (
        <ul className="pagination">
          {!showEllipsis ? (
            pages
          ) : (
            <>
              <li className={`pagination-item ${pageNumber === 0 ? 'active' : ''}`}>
                <button type="button" className="pagination-link-btn" onClick={() => onPageChange(1)}>1</button>
              </li>
              <li className="pagination-item disabled"><span>...</span></li>
              {middleSlice}
              <li className="pagination-item disabled"><span>...</span></li>
              <li className={`pagination-item ${pageNumber === pageCount - 1 ? 'active' : ''}`}>
                <button type="button" className="pagination-link-btn" onClick={() => onPageChange(pageCount)}>{pageCount}</button>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default Pagination;
