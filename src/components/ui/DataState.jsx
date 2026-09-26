import { Inbox } from 'lucide-react';
import Button from './Button';

export function Skeleton({ className = '' }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}
export function LoadingState({ label = 'Loading…' }) {
  return <div className="loading-state" role="status"><span className="brand-loader" aria-hidden="true" /><span>{label}</span></div>;
}
export function EmptyState({ title = 'No records found', description = 'Try changing your search or filters.', action, icon: Icon = Inbox }) {
  return <div className="empty-panel"><div className="empty-icon"><Icon aria-hidden="true" /></div><h2>{title}</h2><p>{description}</p>{action}</div>;
}
export function ErrorState({ onRetry, error }) {
  const forbidden = error?.code === 'FORBIDDEN';
  const unavailable = error?.code === 'UNAVAILABLE';
  return <div className="empty-panel" role="alert"><h2>{forbidden ? 'Access restricted' : unavailable ? 'Service unavailable' : 'Unable to load records'}</h2><p>{forbidden ? 'Your current permissions do not allow this request. Contact your administrator.' : unavailable ? 'This service is not connected yet.' : 'Please try again. If the problem continues, contact your support team.'}</p>{onRetry && !forbidden && !unavailable && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}
