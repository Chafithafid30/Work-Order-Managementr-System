import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/modal';
import { StatusBadge } from '../components/status-badge';
import { useAuth } from '../context/auth-context';
import { api } from '../lib/api';
import type { WorkOrder } from '../types';

export function WorkOrderListPage() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); setWorkOrders(await api.workOrders()); setError(''); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to load data'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => workOrders.filter((item) =>
    `${item.title} ${item.status} ${item.assignedMechanic?.name ?? ''}`.toLowerCase().includes(query.toLowerCase())), [workOrders, query]);
  const openCount = workOrders.filter((item) => item.status !== 'COMPLETED').length;
  const workingCount = workOrders.filter((item) => item.status === 'WORKING').length;

  return <>
    <div className="page-heading"><div><p className="eyebrow">Maintenance operations</p><h1>Work orders</h1><p>Track every request from draft to completion.</p></div>
      {user?.role === 'ADMIN' && <button className="button button--primary" onClick={() => setShowCreate(true)}>+ Create work order</button>}
    </div>
    <div className="metrics">
      <article><span>All orders</span><strong>{workOrders.length}</strong></article>
      <article><span>Open</span><strong>{openCount}</strong></article>
      <article><span>In progress</span><strong>{workingCount}</strong></article>
    </div>
    <section className="panel">
      <div className="panel-toolbar"><div><h2>Recent requests</h2><p>{filtered.length} record{filtered.length === 1 ? '' : 's'}</p></div>
        <input className="search" placeholder="Search title, status, mechanic..." value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      {error && <div className="alert alert--error">{error} <button onClick={() => void load()}>Retry</button></div>}
      {loading ? <div className="empty">Loading work orders...</div> : filtered.length === 0 ? <div className="empty"><strong>No work orders found</strong><p>Create the first request or change the search term.</p></div> :
        <div className="table-wrap"><table><thead><tr><th>Work order</th><th>Status</th><th>Mechanic</th><th>Created</th><th></th></tr></thead>
          <tbody>{filtered.map((item) => <tr key={item.id}>
            <td><strong>{item.title}</strong><small>#{item.id.slice(0, 8).toUpperCase()}</small></td>
            <td><StatusBadge status={item.status} /></td>
            <td>{item.assignedMechanic?.name ?? <span className="muted">Not assigned</span>}</td>
            <td>{formatDate(item.createdAt)}</td>
            <td><Link className="table-link" to={`/work-orders/${item.id}`}>View →</Link></td>
          </tr>)}</tbody></table></div>}
    </section>
    {showCreate && <CreateWorkOrderModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); void load(); }} />}
  </>;
}

function CreateWorkOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { setBusy(true); await api.mutate('/work-orders', { title: form.get('title'), description: form.get('description') }); onCreated(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to create work order'); }
    finally { setBusy(false); }
  }
  return <Modal title="Create work order" onClose={onClose}><form onSubmit={submit}>
    <label>Title<input name="title" minLength={3} maxLength={150} required placeholder="e.g. Repair hydraulic pump" /></label>
    <label>Description<textarea name="description" maxLength={2000} rows={5} placeholder="Describe the issue and expected work..." /></label>
    {error && <div className="alert alert--error">{error}</div>}
    <div className="form-actions"><button type="button" className="button" onClick={onClose}>Cancel</button><button className="button button--primary" disabled={busy}>{busy ? 'Creating...' : 'Create draft'}</button></div>
  </form></Modal>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value)); }
