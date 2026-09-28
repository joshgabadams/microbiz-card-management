// Shared input validation only. These demo limits are not bank policy.
export function validateBatchDetails(input, reference, existingCards = []) {
  const errors = {};
  const clean = value => String(value ?? '').trim();
  const batch = clean(input.batch).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(batch)) errors.batch = 'Use 3–40 letters, numbers, hyphens or underscores.';
  if (existingCards.some(card => card.batch?.toUpperCase() === batch)) errors.batch = 'This batch reference already exists.';
  if (!reference.branches.includes(input.branch)) errors.branch = 'Select a branch.';
  if (!reference.products.includes(input.product)) errors.product = 'Select a card product.';
  if (!reference.schemes.includes(input.scheme)) errors.scheme = 'Select a card scheme.';
  const date = clean(input.receivedOn);
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date > reference.reportingDate) errors.receivedOn = 'Enter a valid date on or before the demo snapshot date.';
  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > reference.maxManualCards) errors.quantity = `Enter a quantity from 1 to ${reference.maxManualCards}.`;
  return errors;
}

export function validateReceipt(input, reference, existingCards = []) {
  const errors = validateBatchDetails(input, reference, existingCards);
  const clean = value => String(value ?? '').trim();
  const date = clean(input.receivedOn);
  const rows = Array.isArray(input.cards) ? input.cards : [];
  if (!errors.quantity && rows.length !== Number(input.quantity)) errors.quantity = `Quantity must match the card rows (1–${reference.maxManualCards}).`;
  const serials = new Set(existingCards.map(card => card.serial.toUpperCase()));
  rows.forEach((row, index) => {
    const serial = clean(row.serial).toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(serial)) errors[`cards.${index}.serial`] = 'Use 3–40 letters, numbers, hyphens or underscores.';
    else if (serials.has(serial)) errors[`cards.${index}.serial`] = 'Serial numbers must be unique across stock and this batch.';
    serials.add(serial);
    if (!/^\d{4}$/.test(clean(row.lastFour))) errors[`cards.${index}.lastFour`] = 'Enter exactly four digits; never enter full PAN.';
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(clean(row.expiry)) || row.expiry < date.slice(0, 7) || row.expiry < reference.reportingDate.slice(0, 7)) errors[`cards.${index}.expiry`] = 'Expiry must be a valid month, no earlier than receipt or the snapshot month.';
  });
  return errors;
}
