import logo from '../../../public/assets/image.png';

export default function BrandLogo({ light = false, className = '' }) {
  return <img
    className={`brand-logo ${light ? 'brand-logo-light' : ''} ${className}`}
    src={logo}
    alt="MicroBiz Microfinance Bank"
    width={956}
    height={285}
    decoding="async"
  />;
}
