import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/Projects/ProjectList';
import ProjectForm from './pages/Projects/ProjectForm';
import ProjectDetails from './pages/Projects/ProjectDetails';
import WorkerList from './pages/Workers/WorkerList';
import WorkerDetails from './pages/Workers/WorkerDetails';
import AttendanceMarking from './pages/Attendance/AttendanceMarking';
import AttendanceHistory from './pages/Attendance/AttendanceHistory';
import AttendanceCalendar from './pages/Attendance/AttendanceCalendar';
import PaymentList from './pages/Payments/PaymentList';
import MaterialList from './pages/Materials/MaterialList';
import ExpenseList from './pages/Expenses/ExpenseList';
import ClientAdvanceList from './pages/ClientAdvances/ClientAdvanceList';
import InvoiceList from './pages/Invoices/InvoiceList';
import Settings from './pages/Settings/Settings';
import Reports from './pages/Reports/Reports';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BulkPayment from './pages/Payments/BulkPayment';
import EquipmentList from './pages/Equipment/EquipmentList';
import WorkDiaryList from './pages/WorkDiary/WorkDiaryList';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  // Auto dark mode: follow system preference
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
        <Router>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <ProjectForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/workers"
            element={
              <ProtectedRoute>
                <WorkerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/workers/:workerId"
            element={
              <ProtectedRoute>
                <WorkerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/workers/:workerId/edit"
            element={<Navigate to={`/projects/${window.location.pathname.split('/')[2]}/workers`} replace />}
          />
          <Route
            path="/projects/:id/attendance"
            element={
              <ProtectedRoute>
                <AttendanceMarking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/payments"
            element={
              <ProtectedRoute>
                <PaymentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/materials"
            element={
              <ProtectedRoute>
                <MaterialList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/expenses"
            element={
              <ProtectedRoute>
                <ExpenseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/invoices"
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/client-advances"
            element={
              <ProtectedRoute>
                <ClientAdvanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers"
            element={
              <ProtectedRoute>
                <WorkerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/new"
            element={<Navigate to="/workers" replace />}
          />
          <Route
            path="/workers/:id"
            element={
              <ProtectedRoute>
                <WorkerDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/:id/edit"
            element={<Navigate to="/workers" replace />}
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceMarking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/history"
            element={
              <ProtectedRoute>
                <AttendanceHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments/new"
            element={<Navigate to="/payments" replace />}
          />
          <Route
            path="/payments/:id/edit"
            element={<Navigate to="/payments" replace />}
          />
          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <MaterialList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/new"
            element={<Navigate to="/materials" replace />}
          />
          <Route
            path="/materials/:id/edit"
            element={<Navigate to="/materials" replace />}
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpenseList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/new"
            element={<Navigate to="/expenses" replace />}
          />
          <Route
            path="/expenses/:id/edit"
            element={<Navigate to="/expenses" replace />}
          />
          <Route
            path="/client-advances"
            element={
              <ProtectedRoute>
                <ClientAdvanceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-advances/new"
            element={<Navigate to="/client-advances" replace />}
          />
          <Route
            path="/client-advances/:id/edit"
            element={<Navigate to="/client-advances" replace />}
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <InvoiceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/new"
            element={<Navigate to="/invoices" replace />}
          />
          <Route
            path="/invoices/:id/edit"
            element={<Navigate to="/invoices" replace />}
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/bulk-payment"
            element={
              <ProtectedRoute>
                <BulkPayment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/equipment"
            element={
              <ProtectedRoute>
                <EquipmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/diary"
            element={
              <ProtectedRoute>
                <WorkDiaryList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers/:id/attendance-calendar"
            element={
              <ProtectedRoute>
                <AttendanceCalendar />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
