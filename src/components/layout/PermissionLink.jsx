import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Keep read-only labels visible; hide action buttons without route permission.
export default function PermissionLink({ to, className = '', children, ...props }) {
  const { canVisit } = useAuth();
  const path = typeof to === 'string' ? to.split(/[?#]/)[0] : to.pathname;
  if (!canVisit(path)) return className.split(' ').includes('btn') ? null : <span>{children}</span>;
  return <Link to={to} className={className} {...props}>{children}</Link>;
}
