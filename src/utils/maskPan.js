// Only the final four digits are ever eligible for presentation.
export function maskPan(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return `•••• •••• •••• ${digits.length >= 4 ? digits.slice(-4) : '••••'}`;
}
