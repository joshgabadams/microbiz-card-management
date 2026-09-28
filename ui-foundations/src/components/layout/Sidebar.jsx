import BrandLogo from '../ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useId, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navigation } from '../../config/navigation';

function Group({ item, onNavigate }) {
  const [open, setOpen] = useState(true);
  const id = useId();
  const Icon = item.icon;
  return <div><button className="nav-parent" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}><span className="nav-label"><Icon size={17} />{item.label}</span>{open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button>
    <div id={id} className="nav-children" hidden={!open}>{item.children.map(child => {
      const ChildIcon = child.icon;
      return <NavLink end key={child.to} to={child.to} onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><ChildIcon size={14} />{child.label}</NavLink>;
    })}</div>
  </div>;
}
export default function Sidebar({ onNavigate, mobile = false }) {
  const { canVisit } = useAuth();
  const visibleNavigation = navigation.map(item => item.children ? { ...item, children: item.children.filter(child => canVisit(child.to)) } : item).filter(item => item.children ? item.children.length : canVisit(item.to));
  return <aside className={`sidebar ${mobile ? 'sidebar-mobile' : 'sidebar-desktop'}`}>
    <div className="brand"><BrandLogo light /><small>Card Operations</small></div>
    <nav aria-label="Main navigation">{visibleNavigation.map(item => item.children ? <Group key={item.label} item={item} onNavigate={onNavigate} /> : <NavLink end key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><item.icon size={17} />{item.label}</NavLink>)}</nav>
    <div className="sidebar-footer">MicroBiz Microfinance Bank<br />Card Operations</div>
  </aside>;
}
