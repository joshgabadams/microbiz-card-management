// Vector interpretation of the supplied MicroBiz references; no card data embedded.
export default function BrandLogo({ light = false, className = '' }) {
  return <svg className={`brand-logo ${light ? 'brand-logo-light' : ''} ${className}`} viewBox="0 0 240 62" role="img" aria-label="MicroBiz Microfinance Bank" focusable="false">
    <path className="brand-logo-band" d="M3 47 29 4 33 11 11 47Z" />
    <path className="brand-logo-band" d="M16 47 37 11 42 19 25 47Z" />
    <path fill="currentColor" d="M29 47 46 19 65 47H55L46 32 37 47Z" />
    <path className="brand-logo-accent" d="M19 58C32 45 50 42 72 43 52 45 39 50 32 58Z" />
    <text x="70" y="39" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="700">MICROBIZ</text>
    <text x="71" y="53" fill="currentColor" fontFamily="Arial, sans-serif" fontSize="10">Microfinance Bank Ltd</text>
  </svg>;
}
