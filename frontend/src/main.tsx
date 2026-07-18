import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/app-shell';
import { ProtectedRoute } from './components/protected-route';
import { AuthProvider } from './context/auth-context';
import { LoginPage } from './pages/login-page';
import { WorkOrderDetailPage } from './pages/work-order-detail-page';
import { WorkOrderListPage } from './pages/work-order-list-page';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><AuthProvider><Routes><Route path="login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route element={<AppShell />}><Route index element={<WorkOrderListPage />} /><Route path="work-orders/:id" element={<WorkOrderDetailPage />} /></Route></Route></Routes></AuthProvider></BrowserRouter></StrictMode>);

