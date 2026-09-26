import { useAuth } from '../../context/AuthContext';
import { Ban, Link2Off, RefreshCcw, Snowflake, Unlock } from 'lucide-react';
import Button from '../../components/ui/Button';

const ACTION_CONFIG = {
  freeze:   { label: 'Freeze Card',   Icon: Snowflake,  variant: 'secondary', ariaLabel: 'Freeze this card' },
  unfreeze: { label: 'Unfreeze Card', Icon: Unlock,     variant: 'secondary', ariaLabel: 'Unfreeze this card' },
  block:    { label: 'Block Card',    Icon: Ban,        variant: 'danger',    ariaLabel: 'Block and hotlist this card' },
  unlink:   { label: 'Unlink Card',   Icon: Link2Off,   variant: 'danger',    ariaLabel: 'Unlink card from customer account' },
  reassign: { label: 'Reassign',      Icon: RefreshCcw, variant: 'secondary', ariaLabel: 'Reassign or replace this card' },
};

export default function LifecycleActions({ card, onAction, busy = false }) {
  const { can } = useAuth();
  const permitted = Array.isArray(card?.allowedActions) ? card.allowedActions.filter(key => Object.hasOwn(ACTION_CONFIG, key) && can(`cards.${key}`)) : [];
  return <div className="lifecycle-actions">
    {permitted.map(key => {
      const { label, Icon, variant, ariaLabel } = ACTION_CONFIG[key];
      return <Button key={key} variant={variant} disabled={busy} aria-label={ariaLabel} onClick={() => onAction(key)}><Icon size={15} aria-hidden="true" />{label}</Button>;
    })}
    {!permitted.length && <p className="lifecycle-note">No lifecycle actions are available for this card with your current access.</p>}
  </div>;
}
