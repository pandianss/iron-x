
import React, { useEffect, useState } from 'react';
import { BillingClient } from '../domain/billing';
import { useNavigate } from 'react-router-dom';



export default function PricingPage() {
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
            name: 'EVAL',
            price: '$0',
            subtitle: 'Node Evaluation',
            features: [
                'Max 3 Actions / Node',
                'SOFT Enforcement',
                'Basic Compliance Engine',
                'Local Audit Stream'
            ],
            cta: 'Current Evaluation',
            disabled: true
        },
        {
            id: 'INDIVIDUAL_PRO',
            name: 'OPERATOR',
            price: '$49',
            subtitle: 'Mission-Critical Node',
            features: [
                'Unlimited Actions',
                'HARD Enforcement (Lockouts)',
                'Discipline Trajectory Engine',
                '90-Day Audit Retention',
                'Operational API Access'
            ],
            cta: 'Initialize Node',
            disabled: false
        },
        {
            id: 'TEAM_ENTERPRISE',
            name: 'INSTITUTIONAL',
            price: 'CUSTOM',
            subtitle: 'Governance Cluster',
            features: [
                'Institutional Policy Clusters',
                'Immutable Audit Protocol',
                'SAML / Architecture SSO',
                'Dedicated System Analyst',
                'On-Premise Resilience'
            ],
            cta: 'Contact Architecture',
            disabled: false
        }
    ];

    const handleUpgrade = async (tierId: string) => {
        if (tierId === 'TEAM_ENTERPRISE') {
            window.location.assign('mailto:enterprise@iron-x.com?subject=Institutional Deployment Inquiry');
            return;
        }

        try {
            const priceId = tierId === 'INDIVIDUAL_PRO' ? 'price_pro_monthly' : 'price_enterprise_seats';
            const { url } = await BillingClient.createCheckoutSession(priceId, window.location.href, window.location.href);
            if (url) {
                window.location.assign(url);
            } else {
                alert('Checkout initialization failed.');
            }
        } catch (err) {
            console.error('Upgrade error:', err);
            alert('Encountered error during initialization.');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white py-24 px-6 infrastructure-bg">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-5xl md:text-6xl font-bold font-display uppercase tracking-tight mb-6">
                        Infrastructure Licensing
                    </h2>
                    <p className="text-xl text-neutral-500 font-mono">
                        Scale from node evaluation to distributed institutional governance.
                    </p>
                    {currentTier !== 'FREE' && (
                        <button
                            onClick={async () => {
                                try {
                                    const { url } = await BillingClient.createPortalSession(window.location.href);
                                    if (url) window.location.href = url;
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                            className="mt-8 inline-flex items-center px-6 py-2 border border-iron-700 text-xs font-mono uppercase tracking-widest text-iron-400 hover:text-white transition-colors"
                        >
                            [ Manage Deployment Cluster ]
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map((tier) => {
                        const isCurrent = currentTier === tier.id;
                        const isOperator = tier.id === 'INDIVIDUAL_PRO';

                        return (
                            <div
                                key={tier.id}
                                className={`p-10 bg-iron-950/30 border glass-panel flex flex-col hardened-border
                                    ${isOperator ? 'border-iron-400' : 'border-iron-800'}
                                    ${isCurrent ? 'ring-1 ring-white/20' : ''}`}
                            >
                                <div className="mb-10">
                                    <h3 className="text-xs font-mono text-iron-500 mb-4 uppercase tracking-[0.4em]">{tier.subtitle}</h3>
                                    <div className="text-4xl font-bold text-white mb-2 font-display uppercase">{tier.name}</div>
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-3xl font-bold text-white font-display tabular-nums">
                                            {tier.price}
                                        </span>
                                        {tier.price.startsWith('$') && tier.price !== '$0' && (
                                            <span className="text-xs font-mono text-iron-500 uppercase">/ node / mo</span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-12 flex-grow border-t border-iron-800 pt-8">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-xs uppercase tracking-widest font-mono text-neutral-400">
                                            <span className="text-iron-600">▸</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => !isCurrent && handleUpgrade(tier.id)}
                                    disabled={isCurrent}
                                    className={`w-full py-4 font-bold font-display uppercase tracking-widest text-sm transition-all
                                        ${isCurrent
                                            ? 'bg-iron-900 text-iron-500 cursor-default border border-iron-800'
                                            : isOperator
                                                ? 'bg-white text-black hover:bg-neutral-200 shadow-lg shadow-iron-500/10'
                                                : 'border border-iron-700 text-iron-200 hover:bg-white hover:text-black'
                                        }`}
                                >
                                    {isCurrent ? 'Active State' : tier.cta}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-24">
                    <button
                        onClick={() => navigate('/')}
                        className="text-iron-600 font-mono text-xs uppercase tracking-[0.4em] hover:text-white transition-colors"
                    >
                        [ Return to System Node ]
                    </button>
                    <div className="mt-8 flex justify-center gap-8 opacity-20 grayscale">
                        {/* Technical Badges Placeholder */}
                        <div className="w-12 h-12 border border-white" />
                        <div className="w-12 h-12 border border-white rotate-45" />
                        <div className="w-12 h-12 border border-white rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

