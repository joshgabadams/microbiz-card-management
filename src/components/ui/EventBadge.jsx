const ACTION_TONE = {
  ISSUED:     'info',
  ACTIVATED:  'success',
  RECEIVED:   'neutral',
  FROZEN:     'warning',
  UNLINKED:   'warning',
  REASSIGNED: 'neutral',
  BLOCKED:    'danger',
  EXPIRED:    'neutral',
  REPLACED:   'neutral',
  LOST:       'danger',
  STOLEN:     'danger',
  DAMAGED:    'warning',
};

export default function EventBadge({ action }) {
  const key = String(action || '').toUpperCase();
  const tone = ACTION_TONE[key] || 'neutral';
  return <span className={`badge badge-${tone}`}>{key}</span>;
}
