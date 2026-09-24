import { Search, ShieldCheck } from 'lucide-react';
import { customers, cards } from '../data/mockData';
import CardVisual from '../components/cards/CardVisual';
import StatusBadge from '../components/ui/StatusBadge';

export default function IssueCardPage() {
  const customer = customers[0];
  const available = cards.find(c => c.status === 'AVAILABLE');
  return (
    <div className="page">
      <div className="page-header"><div><h1>Issue Card</h1><p>Guided issuance flow: customer, account, available card, PIN and confirmation.</p></div></div>
      <div className="steps"><div className="step active">1. Customer</div><div className="step">2. Card</div><div className="step">3. PIN</div><div className="step">4. Review</div></div>
      <div className="issue-shell">
        <section className="card form-card">
          <div className="section-title"><h2>Find Customer</h2></div>
          <div className="form-group"><label>Account number, Customer ID or phone</label><div className="search" style={{width:'100%',minWidth:0}}><Search size={16}/><input placeholder="Search customer" /></div></div>
          <div className="customer-result"><div><strong style={{display:'block',color:'#172a3d'}}>{customer.name}</strong><span style={{fontSize:12,color:'#7b8ea1'}}>{customer.id} • {customer.account} • {customer.branch}</span></div><StatusBadge status={customer.status}/></div>
          <div className="form-group" style={{marginTop:18}}><label>Eligible account</label><select className="input"><option>Savings Account •••• 7891</option></select></div>
          <div className="form-group"><label>Available card</label><select className="input"><option>{available.serial} • {available.pan} • {available.product}</option></select></div>
          <div className="info-box"><ShieldCheck size={16} style={{verticalAlign:'middle',marginRight:7}}/>PIN/default-PIN fields will be implemented exactly to the processor API contract. PIN values will never be persisted or logged by this frontend.</div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}><button className="btn btn-primary">Continue to PIN</button></div>
        </section>
        <aside className="card form-card"><div className="section-title"><h2>Selected Card</h2></div><CardVisual card={available} compact/><div style={{marginTop:18,fontSize:12,color:'#7b8ea1'}}>This preview is a UI representation. Live card data will be loaded from the available-card endpoint.</div></aside>
      </div>
    </div>
  );
}
