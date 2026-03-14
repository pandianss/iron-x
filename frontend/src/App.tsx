import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    const [lockoutData, setLockoutData] = useState<any>(null);

    useEffect(() => {
        const handleQuota = (e: any) => setUpgradeResource(e.detail.resource);
        const handleLockout = (e: any) => setLockoutData(e.detail);
        const handleAuthFail = () => {
            // Potential unified logout trigger
            console.warn('Authentication failure detected. Session may be invalid.');
        };

        window.addEventListener('iron-x:quota-exceeded', handleQuota as EventListener);
        window.addEventListener('iron-x:system-lockout', handleLockout as EventListener);
        window.addEventListener('iron-x:auth-failure', handleAuthFail as EventListener);

        return () => {
            window.removeEventListener('iron-x:quota-exceeded', handleQuota as EventListener);
            window.removeEventListener('iron-x:system-lockout', handleLockout as EventListener);
            window.removeEventListener('iron-x:auth-failure', handleAuthFail as EventListener);
        };
    }, []);

    return (
        <ErrorBoundary>
            <AuthProvider>
                <DisciplineProvider>
                    <Router basename={basename}>
                        <Routes>
                            {/* Governance Lockout Override */}
                            {lockoutData && (
                                <Route path="*" element={<Navigate to="/lockout" replace />} />
                            )}

                            {/* Protected app routes */}
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
                                <Route path="/lockout" element={
                                    <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
                                        <div className="max-w-md text-center border border-red-900 bg-red-950/20 p-8 rounded-2xl">
                                            <h1 className="text-3xl font-bold text-red-500 mb-4">SYSTEM LOCKOUT</h1>
                                            <p className="text-red-200/70 mb-6">{lockoutData?.message || 'Access restricted due to governance breach.'}</p>
                                            {lockoutData?.lockedUntil && (
                                                <p className="text-sm font-mono text-red-500/50">LOCKED UNTIL: {new Date(lockoutData.lockedUntil).toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                } />
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
