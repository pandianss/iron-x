import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import MarketingRouter from './MarketingRouter';
import '@testing-library/jest-dom';

// Mock the page components to avoid testing their internal complexity
vi.mock('../pages/marketing/HomePage', () => ({ default: () => <div>HomePage Mock</div> }));
vi.mock('../pages/PricingPage', () => ({ default: () => <div>PricingPage Mock</div> }));
vi.mock('../pages/LoginPage', () => ({ default: () => <div>LoginPage Mock</div> }));


describe('MarketingRouter Isolation', () => {
    it('renders HomePage at root route without AuthProvider', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <MarketingRouter />
            </MemoryRouter>
        );
        expect(screen.getByText('HomePage Mock')).toBeInTheDocument();
    });

    it('renders PricingPage at /pricing without AuthProvider', () => {
        render(
            <MemoryRouter initialEntries={['/pricing']}>
                <MarketingRouter />
            </MemoryRouter>
        );
        expect(screen.getByText('PricingPage Mock')).toBeInTheDocument();
    });

    it('renders LoginPage at /login', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <MarketingRouter />
            </MemoryRouter>
        );
        expect(screen.getByText('LoginPage Mock')).toBeInTheDocument();
    });

    it('renders 404 for unknown routes', () => {
        render(
            <MemoryRouter initialEntries={['/unknown-route-123']}>
                <MarketingRouter />
            </MemoryRouter>
        );
        expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
    });
});
