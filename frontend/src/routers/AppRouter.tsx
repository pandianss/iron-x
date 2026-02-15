import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardPage from '../pages/DashboardPage';
import CockpitPage from '../pages/CockpitPage';
import GoalsPage from '../pages/GoalsPage';
import ActionsPage from '../pages/ActionsPage';
import SecuritySettingsPage from '../pages/SecuritySettingsPage';
import OrganizationDashboardPage from '../pages/OrganizationDashboardPage';
import BillingPortalPage from '../pages/BillingPortalPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRouter: React.FC = () => {
    return (
        <Routes>
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
            {/* /pricing moved to MarketingRouter */}
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
                path="/billing"
                element={
                    <ProtectedRoute>
                        <BillingPortalPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default AppRouter;
