export default function MetricCard({ label, value, caption, icon: Icon }) {
  return <div className="card kpi"><div className="kpi-head"><span>{label}</span>{Icon && <span className="kpi-icon"><Icon size={17} aria-hidden="true" /></span>}</div><strong>{value}</strong>{caption && <small>{caption}</small>}</div>;
}
