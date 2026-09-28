import { cardStatuses } from '../../config/cardStatuses';
export default function StatusBadge({ status }) {
  const value = String(status || 'UNKNOWN').toUpperCase();
  const tone = cardStatuses[value] || 'neutral';
  return <span className={`badge badge-${tone}`}>{value}</span>;
}
