import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const demoAccounts = [
  ['Admin', 'admin@workflow.local'],
  ['SPV', 'spv@workflow.local'],
  ['Mechanic', 'mechanic@workflow.local'],
] as const;

export function LoginPage() {
  const { user, login } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState('admin@workflow.local'); const [password, setPassword] = useState('Password123!');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    try { setBusy(true); setError(''); await login(email, password); navigate('/'); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Login failed'); }
    finally { setBusy(false); }
  }

  return <main className="login-page"><section className="login-card">
    <div className="login-brand"><span className="brand-mark">W</span><div><strong>WorkFlow</strong><small>Secure operations workspace</small></div></div>
    <p className="eyebrow">Welcome back</p><h1>Sign in to continue</h1><p className="login-intro">Use your assigned account to access role-based work order actions.</p>
    <form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
      {error && <div className="alert alert--error">{error}</div>}<button className="button button--primary login-button" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
    </form>
    <div className="demo-accounts"><small>Demo accounts · password: Password123!</small>{demoAccounts.map(([role, account]) => <button key={account} onClick={() => { setEmail(account); setPassword('Password123!'); }}><strong>{role}</strong><span>{account}</span></button>)}</div>
  </section><aside className="login-visual"><div><p>Authenticated workflow</p><h2>Right person.<br />Right action.<br />Right time.</h2><span>JWT authentication · Role-based access · ACID transactions</span></div></aside></main>;
}
