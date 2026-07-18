import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

export function AppShell() {
  const { user, logout } = useAuth();
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">W</span><div><strong>WorkFlow</strong><small>Operations</small></div></div>
      <nav><NavLink to="/" end>Work orders</NavLink></nav>
      <div className="sidebar-note"><strong>Simple. Traceable.</strong><p>Every action follows the defined work order lifecycle.</p></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div><small>Signed in as</small><strong>{user?.name}</strong></div>
        <div className="user-session"><span>{user?.role}</span><small>{user?.email}</small></div>
        <button className="button" onClick={logout}>Log out</button>
      </header>
      <div className="page"><Outlet /></div>
    </main>
  </div>;
}

