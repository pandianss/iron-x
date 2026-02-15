
import React, { useEffect, useState } from 'react';
import { BillingClient } from '../domain/billing';
import { useNavigate } from 'react-router-dom';

interface Subscription {
    plan_tier: 'FREE' | 'INDIVIDUAL_PRO' | 'TEAM_ENTERPRISE';
}

const PricingPage: React.FC = () => {
    const [currentTier, setCurrentTier] = useState<string>('FREE');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await BillingClient.getSubscription();
                setCurrentTier(res.plan_tier);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSubscription();
    }, []);

    const tiers = [
        {
            id: 'FREE',
            name: 'Iron-X Free',
            price: '$0',
            features: [
                'Max 3 Actions',
                'Max 3 Goals',
                'Soft Enforcement Only',
                'Basic Tracking'
            ],
            cta: 'Current Plan',
            disabled: true
        },
        {
            id: 'INDIVIDUAL_PRO',
            name: 'Iron-X Pro',
            price: '$29/mo',
            features: [
                'Unlimited Actions',
                'Unlimited Goals',
                'Hard Enforcement Mode',
                'Strict Mode Lockouts',
                '90-Day Analytics',
                'Priority Support'
            ],
            cta: 'Upgrade to Pro',
            disabled: false
        },
        {
            id: 'TEAM_ENTERPRISE',
            name: 'Iron-X Enterprise',
            price: '$149/seat',
            features: [
                'Everything in Pro',
                'Unlimited Teams',
                'Organization Policies',
                'SSO / SAML',
                'Audit Log Export',
                'Dedicated Success Manager'
            ],
            cta: 'Contact Sales',
            disabled: false
        }
    ];


    const handleUpgrade = async (tierId: string) => {
        if (tierId === 'TEAM_ENTERPRISE') {
            window.location.href = 'mailto:sales@iron-x.com?subject=Enterprise Inquiry';
            return;
        }

        try {
            // Use mock price IDs for now. In prod, these come from env or config.
            const priceId = tierId === 'INDIVIDUAL_PRO' ? 'price_pro_monthly' : 'price_enterprise_seats';
            const { url } = await BillingClient.createCheckoutSession(priceId, window.location.href, window.location.href);
            if (url) {
                window.location.href = url;
            } else {
                alert('Failed to initiate checkout.');
            }
        } catch (err) {
            console.error('Upgrade error:', err);
            alert('Error initiating upgrade. Please try again.');
        }
    };

    const handleManageBilling = async () => {
        try {
            const { url } = await BillingClient.createPortalSession(window.location.href);
            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            console.error('Portal error:', err);
            alert('Error opening billing portal.');
        }
    };

    return (
        <div className="min-h-screen bg-iron-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-iron-900 sm:text-4xl">
                    Simple, Transparent Pricing
                </h2>
                <p className="mt-4 text-xl text-iron-600">
                    Invest in your operational discipline.
                </p>
                {currentTier !== 'FREE' && (
                    <button
                        onClick={handleManageBilling}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                        Manage Billing & Subscription
                    </button>
                )}
            </div>

            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                {tiers.map((tier) => {
                    const isCurrent = currentTier === tier.id;
                    return (
                        <div key={tier.id} className={`border border-iron-200 rounded-lg shadow-sm divide-y divide-iron-200 bg-white ${isCurrent ? 'ring-2 ring-indigo-500' : ''}`}>
                            <div className="p-6">
                                <h3 className="text-lg leading-6 font-medium text-iron-900">{tier.name}</h3>
                                <p className="mt-4">
                                    <span className="text-4xl font-extrabold text-iron-900">{tier.price}</span>
                                    {tier.price !== '$0' && <span className="text-base font-medium text-iron-500">/mo</span>}
                                </p>
                                <button
                                    onClick={() => !isCurrent && handleUpgrade(tier.id)}
                                    disabled={isCurrent}
                                    className={`mt-8 block w-full py-2 px-4 border border-transparent rounded-md text-center text-sm font-medium ${isCurrent
                                        ? 'bg-green-100 text-green-800 cursor-default'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {isCurrent ? 'Current Plan' : tier.cta}
                                </button>
                            </div>
                            <div className="pt-6 pb-8 px-6">
                                <h4 className="text-sm font-medium text-iron-900 tracking-wide uppercase">What's included</h4>
                                <ul className="mt-6 space-y-4">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex space-x-3">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-base text-iron-500">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-8">
                <button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-500">
                    &larr; Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default PricingPage;
