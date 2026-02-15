import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CockpitPage from './pages/CockpitPage';
import GoalsPage from './pages/GoalsPage';
import ActionsPage from './pages/ActionsPage';
// import ActionInstancePage from './pages/ActionInstancePage'; // Removed as likely unused or causing errors
import PricingPage from './pages/PricingPage';
import ROICalculatorPage from './pages/ROICalculatorPage';
import HomePage from './pages/marketing/HomePage';
import IndustryPage from './pages/marketing/IndustryPage';
import JoinTeamPage from './pages/JoinTeamPage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import OrganizationDashboardPage from './pages/OrganizationDashboardPage';

console.log('App.tsx loaded');

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', border: '1px solid red', margin: 20, background: 'white' }}>
          <h1>Component Crash</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Marketing Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions/:industry" element={<IndustryPage />} />
            <Route path="/solutions" element={<Navigate to="/" replace />} /> {/* Or a solutions hub page later */}

            {/* App Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cockpit"
              element={
                <ProtectedRoute>
                  <CockpitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <GoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/actions"
              element={
                <ProtectedRoute>
                  <ActionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pricing"
              element={
                <ProtectedRoute>
                  <PricingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roi-calculator"
              element={
                <ROICalculatorPage />
              }
            />
            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <SecuritySettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org/:slug"
              element={
                <ProtectedRoute>
                  <OrganizationDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join/:token"
              element={
                <JoinTeamPage />
              }
            />

            <Route path="*" element={
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                <h1 style={{ fontSize: '2em', marginBottom: 20 }}>404 - Page Not Found</h1>
                <p>The requested route does not exist.</p>
                <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go Home</a>
              </div>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
