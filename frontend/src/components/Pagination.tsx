import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  label?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 24, 48],
  label = 'items',
}) => {
  const btnBase: React.CSSProperties = {
    padding: '0.3rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid #e9ecef',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.65rem 1rem', borderTop: '1px solid #e9ecef',
      background: '#fafafa', flexWrap: 'wrap', gap: '0.5rem'
    }}>
      {/* Left: rows per page + count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>Rows per page:</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          style={{ padding: '0.25rem 0.45rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <span style={{ color: '#6c757d', fontSize: '0.85rem' }}>
          {rangeStart}–{rangeEnd} of {totalItems} {label}
        </span>
      </div>

      {/* Right: page buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{ ...btnBase, background: currentPage === 1 ? '#f8f9fa' : 'white', color: currentPage === 1 ? '#adb5bd' : '#1F7A8C', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >←</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{ ...btnBase, border: `1px solid ${page === currentPage ? '#1F7A8C' : '#e9ecef'}`, background: page === currentPage ? '#1F7A8C' : 'white', color: page === currentPage ? 'white' : '#495057' }}
          >{page}</button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{ ...btnBase, background: currentPage === totalPages ? '#f8f9fa' : 'white', color: currentPage === totalPages ? '#adb5bd' : '#1F7A8C', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >→</button>
      </div>
    </div>
  );
};

export default Pagination;
