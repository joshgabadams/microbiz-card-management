import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { LogOut, Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

export default function AppShell() {
  const { session, demo, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    // Wait until a closing navigation drawer has restored its trigger focus.
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById('main-content');
      const active = document.activeElement;
      if (active === document.body || active?.closest('.sidebar, .topbar')) main?.focus({ preventScroll: true });
      document.title = `${main?.querySelector('h1')?.textContent || 'Card Operations'} · MicroBiz`;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 821px)');
    const closeOnDesktop = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener('change', closeOnDesktop);
    return () => media.removeEventListener('change', closeOnDesktop);
  }, []);
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <Sidebar />
    <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Navigation" drawer><Sidebar mobile onNavigate={() => setMenuOpen(false)} /></Modal>
    <div className="main"><header className="topbar"><div className="topbar-left"><Button className="mobile-menu" variant="secondary" aria-label="Open navigation" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={19} /></Button><div><div className="topbar-title">Card Management</div><div className="topbar-subtitle">MicroBiz Microfinance Bank</div></div></div><div className="session-controls">{!demo && <span className="session-name">{session.user.name}</span>}<Button variant="secondary" onClick={signOut}><LogOut size={17} aria-hidden="true" />Sign out</Button></div></header>
      <main id="main-content" tabIndex={-1} key={pathname}><Outlet /></main>
    </div>
  </div>;
}
