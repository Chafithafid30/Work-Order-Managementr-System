import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Modal } from '../components/modal';
import { StatusBadge } from '../components/status-badge';
import { useAuth } from '../context/auth-context';
import { api } from '../lib/api';
import type { User, WorkOrder } from '../types';

type Dialog = 'assign' | 'update' | 'sparepart' | 'approve' | 'complete' | null;

export function WorkOrderDetailPage() {
  const { id = '' } = useParams(); const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null); const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { try { const [order, availableUsers] = await Promise.all([api.workOrder(id), api.users()]); setWorkOrder(order); setUsers(availableUsers); setError(''); } catch (caught) { setError(message(caught)); } }, [id]);
  useEffect(() => { void load(); }, [load]);

  async function action(path: string, body?: unknown) {
    if (!user) return; try { setBusy(true); await api.mutate(path, body); setDialog(null); await load(); }
    catch (caught) { setError(message(caught)); } finally { setBusy(false); }
  }
  if (!workOrder) return <div className="panel empty">{error || 'Loading work order...'}</div>;
  const pendingRequest = workOrder.sparepartRequests?.find((request) => request.status === 'PENDING');

  return <>
    <Link className="back-link" to="/">← Back to work orders</Link>
    <div className="detail-heading"><div><span className="work-id">WO-{workOrder.id.slice(0, 8).toUpperCase()}</span><h1>{workOrder.title}</h1><p>{workOrder.description || 'No description provided.'}</p></div><StatusBadge status={workOrder.status} /></div>
    {error && <div className="alert alert--error">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
    <div className="detail-grid">
      <section className="panel"><div className="section-heading"><div><p className="eyebrow">Workflow</p><h2>Available actions</h2></div></div>
        <div className="actions">
          {/* The UI exposes only relevant actions for usability. The backend
              remains the authoritative RBAC and workflow enforcement layer. */}
          {user?.role === 'ADMIN' && workOrder.status === 'DRAFT' && <Action title="Submit for review" text="Send this work order to the supervisor." button="Submit work order" onClick={() => void action(`/work-orders/${id}/submit`)} />}
          {user?.role === 'SPV' && workOrder.status === 'SUBMITTED' && <Action title="Assign mechanic" text="Choose a mechanic responsible for this job." button="Assign mechanic" onClick={() => setDialog('assign')} />}
          {user?.role === 'ADMIN' && workOrder.status === 'ASSIGNED' && <Action title="Continue assessment" text="Update details and decide whether spareparts are needed." button="Update assessment" onClick={() => setDialog('update')} />}
          {user?.role === 'ADMIN' && workOrder.status === 'UPDATED' && <Action title="Request spareparts" text="List the required spareparts for supervisor approval." button="Create request" onClick={() => setDialog('sparepart')} />}
          {user?.role === 'SPV' && workOrder.status === 'WAITING_SPAREPART_APPROVAL' && pendingRequest && <Action title="Approve spareparts" text="Review the requested items before work begins." button="Review request" onClick={() => setDialog('approve')} />}
          {user?.role === 'MECHANIC' && workOrder.status === 'READY_TO_WORK' && workOrder.assignedMechanicId === user.id && <Action title="Begin work" text="Record the start time and mark this order as working." button="Start work" onClick={() => void action(`/work-orders/${id}/start`)} />}
          {user?.role === 'ADMIN' && workOrder.status === 'WORKING' && <Action title="Complete work order" text="Enter the actual completion date and close this order." button="Complete order" onClick={() => setDialog('complete')} />}
          {!hasAction(workOrder, user, Boolean(pendingRequest)) && <div className="empty compact"><strong>No action for this role</strong><p>Sign in with the role responsible for the next workflow step.</p></div>}
        </div>
      </section>
      <aside className="panel metadata"><p className="eyebrow">Details</p><h2>Order information</h2>
        <dl><dt>Created by</dt><dd>{workOrder.creator.name}</dd><dt>Assigned mechanic</dt><dd>{workOrder.assignedMechanic?.name ?? 'Not assigned'}</dd><dt>Created</dt><dd>{formatDateTime(workOrder.createdAt)}</dd><dt>Started</dt><dd>{workOrder.startDate ? formatDateTime(workOrder.startDate) : '—'}</dd><dt>Completed</dt><dd>{workOrder.endDate ? formatDateTime(workOrder.endDate) : '—'}</dd></dl>
      </aside>
    </div>
    {workOrder.sparepartRequests?.length > 0 && <section className="panel"><div className="section-heading"><div><p className="eyebrow">Materials</p><h2>Sparepart requests</h2></div></div>
      {workOrder.sparepartRequests.map((request) => <div className="request-card" key={request.id}><div><strong>{request.status}</strong><small>#{request.id.slice(0, 8)}</small></div><ul>{request.items.map((item) => <li key={item.id}>{item.name}<strong>× {item.qty}</strong></li>)}</ul>{request.approvalNote && <p>Note: {request.approvalNote}</p>}</div>)}
    </section>}
    {dialog === 'assign' && <AssignDialog mechanics={users.filter((user) => user.role === 'MECHANIC')} busy={busy} close={() => setDialog(null)} submit={(body) => void action(`/work-orders/${id}/assign`, body)} />}
    {dialog === 'update' && <UpdateDialog workOrder={workOrder} busy={busy} close={() => setDialog(null)} submit={(body) => void action(`/work-orders/${id}/update`, body)} />}
    {dialog === 'sparepart' && <SparepartDialog busy={busy} close={() => setDialog(null)} submit={(body) => void action(`/work-orders/${id}/request-sparepart`, body)} />}
    {dialog === 'approve' && pendingRequest && <ApproveDialog request={pendingRequest} busy={busy} close={() => setDialog(null)} submit={(body) => void action(`/sparepart-requests/${pendingRequest.id}/approve`, body)} />}
    {dialog === 'complete' && <CompleteDialog busy={busy} close={() => setDialog(null)} submit={(body) => void action(`/work-orders/${id}/complete`, body)} />}
  </>;
}

function Action({ title, text, button, onClick }: { title: string; text: string; button: string; onClick: () => void }) { return <article className="action-card"><div><strong>{title}</strong><p>{text}</p></div><button className="button button--primary" onClick={onClick}>{button}</button></article>; }
function FormDialog({ title, children, busy, close, submit }: { title: string; children: ReactNode; busy: boolean; close: () => void; submit: (form: FormData) => void }) { return <Modal title={title} onClose={close}><form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); submit(new FormData(event.currentTarget)); }}>{children}<div className="form-actions"><button type="button" className="button" onClick={close}>Cancel</button><button className="button button--primary" disabled={busy}>{busy ? 'Saving...' : 'Confirm'}</button></div></form></Modal>; }
function AssignDialog({ mechanics, busy, close, submit }: { mechanics: User[]; busy: boolean; close: () => void; submit: (body: unknown) => void }) { return <FormDialog title="Assign mechanic" busy={busy} close={close} submit={(form) => submit({ mechanicId: form.get('mechanicId') })}><label>Mechanic<select name="mechanicId" required>{mechanics.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label></FormDialog>; }
function UpdateDialog({ workOrder, busy, close, submit }: { workOrder: WorkOrder; busy: boolean; close: () => void; submit: (body: unknown) => void }) { return <FormDialog title="Update assessment" busy={busy} close={close} submit={(form) => submit({ title: form.get('title'), description: form.get('description'), needSparepart: form.get('needSparepart') === 'yes' })}><label>Title<input name="title" defaultValue={workOrder.title} required /></label><label>Description<textarea name="description" defaultValue={workOrder.description ?? ''} rows={4} /></label><fieldset><legend>Are spareparts needed?</legend><label className="radio"><input type="radio" name="needSparepart" value="no" defaultChecked /> No, ready to work</label><label className="radio"><input type="radio" name="needSparepart" value="yes" /> Yes, create a request next</label></fieldset></FormDialog>; }
function SparepartDialog({ busy, close, submit }: { busy: boolean; close: () => void; submit: (body: unknown) => void }) { return <FormDialog title="Request spareparts" busy={busy} close={close} submit={(form) => submit({ items: [{ name: form.get('item1'), qty: Number(form.get('qty1')) }, ...(form.get('item2') ? [{ name: form.get('item2'), qty: Number(form.get('qty2')) }] : [])] })}><div className="form-row"><label>Item name<input name="item1" required /></label><label>Qty<input type="number" name="qty1" min="1" defaultValue="1" required /></label></div><div className="form-row"><label>Second item (optional)<input name="item2" /></label><label>Qty<input type="number" name="qty2" min="1" defaultValue="1" /></label></div></FormDialog>; }
function ApproveDialog({ request, busy, close, submit }: { request: WorkOrder['sparepartRequests'][number]; busy: boolean; close: () => void; submit: (body: unknown) => void }) { return <FormDialog title="Approve sparepart request" busy={busy} close={close} submit={(form) => submit({ approvalNote: form.get('approvalNote') })}><div className="review-list">{request.items.map((item) => <div key={item.id}><span>{item.name}</span><strong>× {item.qty}</strong></div>)}</div><label>Approval note<textarea name="approvalNote" rows={3} maxLength={500} /></label></FormDialog>; }
function CompleteDialog({ busy, close, submit }: { busy: boolean; close: () => void; submit: (body: unknown) => void }) { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return <FormDialog title="Complete work order" busy={busy} close={close} submit={(form) => submit({ endDate: new Date(String(form.get('endDate'))).toISOString() })}><label>Completion date and time<input type="datetime-local" name="endDate" defaultValue={now.toISOString().slice(0, 16)} required /></label></FormDialog>; }
function hasAction(order: WorkOrder, actor: User | null, pending: boolean) { if (!actor) return false; return (actor.role === 'ADMIN' && ['DRAFT', 'ASSIGNED', 'UPDATED', 'WORKING'].includes(order.status)) || (actor.role === 'SPV' && (order.status === 'SUBMITTED' || (order.status === 'WAITING_SPAREPART_APPROVAL' && pending))) || (actor.role === 'MECHANIC' && order.status === 'READY_TO_WORK' && order.assignedMechanicId === actor.id); }
function formatDateTime(value: string) { return new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)); }
function message(caught: unknown) { return caught instanceof Error ? caught.message : 'Action could not be completed'; }
