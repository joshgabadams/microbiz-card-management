import { Navigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/ui/BrandLogo';
import Button from '../components/ui/Button';
import CardVisual from '../components/cards/CardVisual';

export function safeReturnPath(value) {
  return typeof value === 'string' && /^\/(?!\/)/.test(value) && !/[\\]/.test(value) && !value.startsWith('/login') ? value : '/overview';
}
export default function LoginPage() {
  const { session, busy, error, demo, signIn, signInAvailable } = useAuth();
  const { state } = useLocation();
  if (session) return <Navigate to={safeReturnPath(state?.from)} replace />;
  return <main className="auth-page"><section className="auth-panel" aria-labelledby="welcome-title">
    <div className="auth-copy">
      <div className="auth-brand"><BrandLogo /></div>
      <span className="auth-eyebrow">CARD OPERATIONS</span>
      <h1 id="welcome-title">Welcome to<br />Card Management</h1>
      <p>Manage card inventory, customer issuance and card operations in one workspace.</p>
      <div className="auth-session"><ShieldCheck aria-hidden="true" size={22} /><div><h2>Staff access</h2><p>{demo ? 'Sign in to access card inventory and customer card operations.' : signInAvailable ? 'Continue with your bank’s staff identity service.' : 'Staff sign-in is not connected yet. Access will be available once your bank’s identity service is configured.'}</p></div></div>
      {error && <p className="form-error-summary" role="alert">{error.message}</p>}
      <Button className="auth-enter" loading={busy} onClick={signIn} disabled={!signInAvailable}>{signInAvailable ? 'Sign in' : 'Staff sign-in unavailable'}</Button>
      <p className="auth-note">Please contact your administrator for access information.</p>
      <footer>MicroBiz Microfinance Bank · Card Operations</footer>
    </div>
    <aside className="auth-art" aria-label="MicroBiz debit cards"><div className="auth-card-professional"><CardVisual card={{ product: 'Professional Debit', pan: '4567', customer: 'MICROBIZ CUSTOMER', expiry: '07/28' }} /></div><div className="auth-card-business"><CardVisual card={{ product: 'Business Debit', pan: '8291', customer: 'MICROBIZ CUSTOMER', expiry: '07/28' }} /></div><p>Professional & Business<br /><strong>Cards built for your customers.</strong></p></aside>
  </section></main>;
}
