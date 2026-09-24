import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

// Native modal dialogs provide focus containment and make background content inert.
export default function Modal({ open, onClose, title, children, footer, drawer = false, busy = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);
  function keepFocusInside(event) {
    if (event.key !== 'Tab') return;
    const focusable = [...ref.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')]
      .filter(element => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
  if (!open) return null;
  return createPortal(<dialog ref={ref} onKeyDown={keepFocusInside} aria-labelledby={titleId} aria-busy={busy || undefined} className={`modal ${drawer ? 'drawer' : ''}`} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header className="modal-header"><h2 id={titleId}>{title}</h2><Button variant="secondary" disabled={busy} aria-label={`Close ${title}`} onClick={onClose}><X size={18} /></Button></header>
    <div className="modal-body">{children}</div>
    {footer && <footer className="modal-footer">{footer}</footer>}
  </dialog>, document.body);
}

export function ConfirmationModal({ open, onClose, onConfirm, title, children, confirmLabel = 'Confirm', danger = false, busy = false }) {
  return <Modal open={open} onClose={onClose} title={title} busy={busy} footer={<><Button variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={onConfirm}>{confirmLabel}</Button></>}>
    {children}
  </Modal>;
}
