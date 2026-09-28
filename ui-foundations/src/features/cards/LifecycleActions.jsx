import { useId } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Ban, CircleCheck, Link2Off, RefreshCcw, Snowflake, Unlock } from 'lucide-react';
import Button from '../../components/ui/Button';

const ACTION_CONFIG = {
  activate: { label: 'Activate Card', Icon: CircleCheck, variant: 'primary', ariaLabel: 'Activate this card' },
  freeze:   { label: 'Freeze Card',   Icon: Snowflake,  variant: 'secondary', ariaLabel: 'Freeze this card' },
  unfreeze: { label: 'Unfreeze Card', Icon: Unlock,     variant: 'secondary', ariaLabel: 'Unfreeze this card' },
  block:    { label: 'Block Card',    Icon: Ban,        variant: 'danger',    ariaLabel: 'Block and hotlist this card' },
  unlink:   { label: 'Unlink Card',   Icon: Link2Off,   variant: 'danger',    ariaLabel: 'Unlink card from customer account' },
  reassign: { label: 'Reassign',      Icon: RefreshCcw, variant: 'secondary', ariaLabel: 'Reassign or replace this card' },
};

export default function LifecycleActions({ card, onAction, busy = false }) {
  const { can } = useAuth();
  const permitted = Array.isArray(card?.allowedActions) ? card.allowedActions.filter(key => Object.hasOwn(ACTION_CONFIG, key) && can(`cards.${key}`)) : [];
  const noteId = useId();
  return <section className="lifecycle-panel" aria-label="Card actions">
    <h2>Card actions</h2>
    <div className="lifecycle-actions">
      {Object.entries(ACTION_CONFIG).map(([key, { label, Icon, variant, ariaLabel }]) => {
        const available = permitted.includes(key);
        return <Button key={key} variant={variant} disabled={busy || !available} aria-label={ariaLabel} aria-describedby={!available ? noteId : undefined} onClick={() => onAction(key)}><Icon size={15} aria-hidden="true" />{label}</Button>;
      })}
    </div>
    <p id={noteId} className="lifecycle-note">Disabled actions are unavailable for this card or your access. They become available when supported by the card service.</p>
  </section>;
}
