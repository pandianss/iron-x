import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { DisciplineProvider } from './context/DisciplineContext';
import MarketingRouter from './routers/MarketingRouter';
import AppRouter from './routers/AppRouter';

console.log('App.tsx loaded');

const basename = import.meta.env.VITE_APP_BASENAME || '/';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DisciplineProvider>
          <Router basename={basename}>
            <Routes>
              {/* App Routes - delegated to AppRouter */}
              <Route path="/dashboard/*" element={<AppRouter />} />
              <Route path="/cockpit/*" element={<AppRouter />} />
              <Route path="/goals/*" element={<AppRouter />} />
              <Route path="/actions/*" element={<AppRouter />} />
              <Route path="/security/*" element={<AppRouter />} />
              <Route path="/org/*" element={<AppRouter />} />
              <Route path="/billing/*" element={<AppRouter />} />

              {/* Explicit root resolution */}
              <Route path="/" element={<MarketingRouter />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<MarketingRouter />} />
            </Routes>
          </Router>
        </DisciplineProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
