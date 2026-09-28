import { forwardRef } from 'react';

export default forwardRef(function Button({ variant = 'primary', loading = false, disabled, children, className = '', type = 'button', ...props }, ref) {
  return <button ref={ref} type={type} className={`btn btn-${variant} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading && <span className="spinner" aria-hidden="true" />}{children}
  </button>;
});
