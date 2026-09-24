import { forwardRef, useId } from 'react';

export default forwardRef(function FormField({ label, hint, error, as: Control = 'input', id, className = '', children, ...props }, ref) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const description = [hint && `${fieldId}-hint`, error && `${fieldId}-error`, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
  return <div className={`form-group ${className}`}>
    <label htmlFor={fieldId}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
    <Control {...props} ref={ref} id={fieldId} className="input" aria-invalid={error ? true : undefined} aria-describedby={description}>{children}</Control>
    {hint && <small id={`${fieldId}-hint`} className="field-hint">{hint}</small>}
    {error && <small id={`${fieldId}-error`} className="field-error" role="alert">{error}</small>}
  </div>;
});
