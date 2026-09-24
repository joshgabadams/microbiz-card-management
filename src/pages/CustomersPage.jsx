import { Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { customers } from '../data/mockData';
import StatusBadge from '../components/ui/StatusBadge';

export default function CustomersPage() {
  return <div className="page"><div className="page-header"><div><h1>Customer Lookup</h1><p>Fetch a customer from the bank API before issuing or managing linked cards.</p></div></div><section className="card section-card"><div className="search" style={{maxWidth:650,minWidth:0}}><Search size={17}/><input placeholder="Search by account number, customer ID, phone or supported identifier"/></div><div style={{marginTop:16}}>{customers.map(c => <div className="customer-result" key={c.id}><div style={{display:'flex',alignItems:'center',gap:12}}><div className="avatar"><Users size={16}/></div><div><strong style={{display:'block',color:'#172a3d'}}>{c.name}</strong><span style={{fontSize:12,color:'#7b8ea1'}}>{c.id} • {c.account} • {c.branch}</span></div></div><div style={{display:'flex',alignItems:'center',gap:12}}><StatusBadge status={c.status}/><Link to={`/customers/${c.id}`} style={{color:'#0f7cf3',fontWeight:800,fontSize:12}}>View</Link></div></div>)}</div></section></div>;
}
