import Button from '../ui/Button';
import { EmptyState, ErrorState, LoadingState, Skeleton } from '../ui/DataState';

export default function DataTable({ label, columns, rows, rowKey = 'id', loading, error, onRetry, page = 1, pageSize = 10, total = rows.length, onPageChange, emptyIcon, emptyTitle, emptyDescription, emptyAction }) {
  if (loading) return <section aria-label={label} aria-busy="true"><LoadingState label={`Loading ${label.toLowerCase()}…`} /><div className="table-skeleton">{[0, 1, 2].map(key => <Skeleton key={key} />)}</div></section>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows.length) return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const cell = (column, row) => column.render ? column.render(row) : row[column.key];
  return <>
    <div className="data-table-desktop"><table><caption className="sr-only">{label}</caption><thead><tr>{columns.map(column => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row[rowKey]}>{columns.map(column => <td key={column.key}>{cell(column, row)}</td>)}</tr>)}</tbody></table></div>
    <ul className="data-table-mobile" aria-label={label}>{rows.map(row => <li key={row[rowKey]}><dl>{columns.map(column => <div key={column.key}><dt>{column.label}</dt><dd>{cell(column, row)}</dd></div>)}</dl></li>)}</ul>
    {onPageChange && <nav className="pagination" aria-label={`${label} pagination`}><span role="status">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span><div><Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button><span>Page {page} of {pageCount}</span><Button variant="secondary" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next</Button></div></nav>}
  </>;
}
