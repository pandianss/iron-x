import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import MarketingRouter from './routers/MarketingRouter';
import AppRouter from './routers/AppRouter';

console.log('App.tsx loaded');

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* App Routes - delegated to AppRouter */}
            <Route path="/dashboard/*" element={<AppRouter />} />
            <Route path="/cockpit/*" element={<AppRouter />} />
            <Route path="/goals/*" element={<AppRouter />} />
            <Route path="/actions/*" element={<AppRouter />} />
            <Route path="/security/*" element={<AppRouter />} />
            <Route path="/org/*" element={<AppRouter />} />
            <Route path="/billing/*" element={<AppRouter />} />

            {/* Marketing Routes & Fallback - delegated to MarketingRouter */}
            <Route path="*" element={<MarketingRouter />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
