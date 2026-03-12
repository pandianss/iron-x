import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { DisciplineProvider } from './context/DisciplineContext';
import MarketingRouter from './routers/MarketingRouter';
import {
    ProtectedRoute,
    DashboardPage,
    CockpitPage,
    GoalsPage,
    ActionsPage,
    SecuritySettingsPage,
    OrganizationDashboardPage,
    BillingPortalPage,
} from './routers/AppRouter';

const basename = import.meta.env.VITE_APP_BASENAME || '/';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <DisciplineProvider>
                    <Router basename={basename}>
                        <Routes>
                            {/* Protected app routes — flat, no delegation */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/cockpit" element={<CockpitPage />} />
                                <Route path="/goals" element={<GoalsPage />} />
                                <Route path="/actions" element={<ActionsPage />} />
                                <Route path="/security" element={<SecuritySettingsPage />} />
                                <Route path="/org/:slug" element={<OrganizationDashboardPage />} />
                                <Route path="/billing" element={<BillingPortalPage />} />
                            </Route>

                            {/* Marketing / public routes */}
                            <Route path="/" element={<MarketingRouter />} />
                            <Route path="*" element={<MarketingRouter />} />
                        </Routes>
                    </Router>
                </DisciplineProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
