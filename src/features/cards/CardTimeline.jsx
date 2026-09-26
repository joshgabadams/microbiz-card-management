import { Clock } from 'lucide-react';
import { EmptyState } from '../../components/ui/DataState';

/**
 * Renders a chronological timeline of card lifecycle events.
 * @param {{ events: Array<{ event: string, timestamp: string, actor: string, note?: string }> }} props
 */
export default function CardTimeline({ events = [] }) {
  if (!events.length) {
    return (
      <EmptyState
        icon={Clock}
        title="No activity recorded"
        description="Lifecycle events will appear here as they occur."
      />
    );
  }

  return (
    <ol className="card-timeline" aria-label="Card activity timeline">
      {events.map((item, index) => (
        <li key={index} className="card-timeline-item">
          <span className="card-timeline-dot" aria-hidden="true" />
          {index < events.length - 1 && (
            <span className="card-timeline-line" aria-hidden="true" />
          )}
          <div className="card-timeline-content">
            <strong>{item.event}</strong>
            {item.note && <p className="card-timeline-note">{item.note}</p>}
            <span className="card-timeline-meta">
              {item.actor} · {item.timestamp}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
