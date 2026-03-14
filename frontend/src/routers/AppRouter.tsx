import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardPage from '../pages/DashboardPage';
import CockpitPage from '../pages/CockpitPage';
import GoalsPage from '../pages/GoalsPage';
import ActionsPage from '../pages/ActionsPage';
import SecuritySettingsPage from '../pages/SecuritySettingsPage';
import OrganizationDashboardPage from '../pages/OrganizationDashboardPage';
import BillingPortalPage from '../pages/BillingPortalPage';
import WitnessPage from '../pages/WitnessPage';
import DriftReportPage from '../pages/DriftReportPage';
import CoachDashboardPage from '../pages/CoachDashboardPage';
import CoachSetupPage from '../pages/CoachSetupPage';
import CompliancePage from '../pages/CompliancePage';
import ApiKeysPage from '../pages/ApiKeysPage';

export const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Individual page exports for use in App.tsx flat routing
export {
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
};
