import { Construction } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/DataState';

export default function SimplePage({ title, description }) {
  return <div className="page"><PageHeader title={title} description={description} /><section className="card"><EmptyState icon={Construction} title={title === 'Settings' ? 'Preferences are not available yet' : 'Reference service unavailable'} description="This workspace is not connected. Contact your administrator if you need to review or change these settings." /></section></div>;
}
