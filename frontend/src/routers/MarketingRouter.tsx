import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from '../pages/marketing/HomePage';
import IndustryPage from '../pages/marketing/IndustryPage';
import PricingPage from '../pages/PricingPage';
import JoinTeamPage from '../pages/JoinTeamPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

const MarketingRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions/:industry" element={<IndustryPage />} />
            <Route path="/solutions" element={<Navigate to="/" replace />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/join/:token" element={<JoinTeamPage />} />

            {/* Auth Routes - Public but often entry points to App */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Fallback for unknown routes */}
            <Route path="*" element={
                <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
                    <h1 style={{ fontSize: '2em', marginBottom: 20 }}>404 - Page Not Found</h1>
                    <p>The requested route does not exist.</p>
                    <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go Home</a>
                </div>
            } />
        </Routes>
    );
};

export default MarketingRouter;
