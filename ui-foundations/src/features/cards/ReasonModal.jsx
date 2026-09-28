import { useState } from 'react';
import { ConfirmationModal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';

const ACTION_LABELS = {
  activate: { title: 'Activate Card', confirm: 'Activate Card', danger: false },
  freeze:   { title: 'Freeze Card',   confirm: 'Freeze Card',   danger: false },
  unfreeze: { title: 'Unfreeze Card', confirm: 'Unfreeze Card', danger: false },
  block:    { title: 'Block Card',    confirm: 'Block Card',    danger: true  },
  unlink:   { title: 'Unlink Card',   confirm: 'Unlink Card',   danger: true  },
  reassign: { title: 'Reassign Card', confirm: 'Reassign',      danger: false },
};

/**
 * Reason-capture confirmation dialog for card lifecycle actions.
 * Wraps ConfirmationModal and requires a reason (≥ 5 chars) before confirming.
 */
export default function ReasonModal({ open, actionKey, onClose, onConfirm, busy = false, error = null }) {
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const invalid = trimmed.length > 0 && trimmed.length < 5;
  const config = ACTION_LABELS[actionKey] ?? { title: 'Confirm Action', confirm: 'Confirm', danger: false };

  function handleClose() {
    setReason('');
    onClose();
  }

  function handleConfirm() {
    if (trimmed.length < 5) return;
    onConfirm(trimmed);
  }

  return (
    <ConfirmationModal
      open={open}
      onClose={handleClose}
      title={config.title}
      confirmLabel={config.confirm}
      danger={config.danger}
      busy={busy}
      onConfirm={handleConfirm}
    >
      <FormField
        label="Reason"
        as="textarea"
        required
        value={reason}
        onChange={e => setReason(e.target.value)}
        hint="Minimum 5 characters. This will be recorded in the card audit log."
        error={
          invalid ? 'Please provide a reason of at least 5 characters.' :
          error   ? error : undefined
        }
        placeholder={`Enter reason for ${config.title.toLowerCase()}…`}
        disabled={busy}
      />
    </ConfirmationModal>
  );
}
