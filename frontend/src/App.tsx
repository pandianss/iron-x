import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { DisciplineProvider } from './context/DisciplineContext';
import MarketingRouter from './routers/MarketingRouter';
import UpgradeModal from './components/UpgradeModal';
import {
    ProtectedRoute,
    DashboardPage,
    CockpitPage,
    GoalsPage,
    ActionsPage,
    SecuritySettingsPage,
    OrganizationDashboardPage,
    BillingPortalPage,
    WitnessPage,
    DriftReportPage,
    CoachDashboardPage,
    CoachSetupPage,
    CompliancePage,
    ApiKeysPage,
} from './routers/AppRouter';

const basename = import.meta.env.VITE_APP_BASENAME || '/';

function App() {
    const [upgradeResource, setUpgradeResource] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            setUpgradeResource(e.detail.resource);
        };
        window.addEventListener('iron-x:quota-exceeded', handler as EventListener);
        return () => window.removeEventListener('iron-x:quota-exceeded', handler as EventListener);
    }, []);

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
                                <Route path="/witness" element={<WitnessPage />} />
                                <Route path="/drift-report" element={<DriftReportPage />} />
                                <Route path="/coach" element={<CoachDashboardPage />} />
                                <Route path="/coach/setup" element={<CoachSetupPage />} />
                                <Route path="/compliance" element={<CompliancePage />} />
                                <Route path="/developer" element={<ApiKeysPage />} />
                            </Route>

                            {/* Marketing / public routes */}
                            <Route path="/" element={<MarketingRouter />} />
                            <Route path="*" element={<MarketingRouter />} />
                        </Routes>

                        {upgradeResource && (
                            <UpgradeModal 
                                resource={upgradeResource} 
                                onClose={() => setUpgradeResource(null)} 
                            />
                        )}
                    </Router>
                </DisciplineProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
