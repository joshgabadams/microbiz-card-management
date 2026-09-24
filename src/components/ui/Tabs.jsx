import { useId, useRef } from 'react';

export default function Tabs({ label, items, value, onChange }) {
  const id = useId();
  const buttons = useRef([]);
  function navigate(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    onChange(items[next].value);
    buttons.current[next].focus();
  }
  return <div><div className="tabs" role="tablist" aria-label={label}>
    {items.map((item, index) => <button type="button" key={item.value} ref={node => { buttons.current[index] = node; }} role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={value === item.value} tabIndex={value === item.value ? 0 : -1} onClick={() => onChange(item.value)} onKeyDown={event => navigate(event, index)}>{item.label}</button>)}
  </div>{items.map((item, index) => <div key={item.value} role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={value !== item.value} tabIndex={0}>{value === item.value && item.content}</div>)}</div>;
}
