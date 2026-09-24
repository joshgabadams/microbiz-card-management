import { Construction } from 'lucide-react';
export default function SimplePage({ title, description }) {
  return <div className="page"><div className="page-header"><div><h1>{title}</h1><p>{description}</p></div></div><div className="card empty-panel"><div className="empty-icon"><Construction size={22}/></div><h3 style={{color:'#172a3d',marginBottom:8}}>Structured and ready for its implementation phase</h3><p style={{maxWidth:560,margin:'0 auto'}}>The route and navigation entry are already in place. The detailed UI and API integration will be completed according to BUILD.md and the matching phase file.</p></div></div>;
}
