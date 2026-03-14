
import { useEffect, useState } from 'react';
import { BillingClient } from '../domain/billing';
import { useNavigate } from 'react-router-dom';



export default function PricingPage() {
    const [subscription, setSubscription] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await BillingClient.getSubscription();
                setSubscription(res);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSubscription();
    }, []);

    const currentTier = subscription?.plan_tier || 'FREE';
    const usage = subscription?.usage || { actions: 0, goals: 0, teams: 0 };
    const maxActions = 3;

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
                {currentTier === 'FREE' && (
                    <div className="mb-16 max-w-md mx-auto">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-mono text-iron-500 uppercase tracking-widest">
                                Free Node Quota: {usage.actions} / {maxActions} Actions
                            </span>
                            <span className="text-[10px] font-mono text-iron-700">
                                {Math.round((usage.actions / maxActions) * 100)}%
                            </span>
                        </div>
                        <div className="h-1 bg-iron-900 overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-1000 ${usage.actions >= maxActions ? 'bg-red-600' : 'bg-white'}`}
                                style={{ width: `${Math.min((usage.actions / maxActions) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="text-center mb-24">
                    <h2 className="text-5xl md:text-6xl font-bold font-display uppercase tracking-tight mb-6">
                        Infrastructure Licensing
                    </h2>
                    <p className="text-xl text-neutral-500 font-mono">
                        Scale from node evaluation to distributed institutional governance.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tiers.map((tier) => {
                        const isCurrent = currentTier === tier.id;
                        const isOperator = tier.id === 'INDIVIDUAL_PRO';
                        const limitsHit = tier.id === 'FREE' && usage.actions >= maxActions;

                        return (
                            <div
                                key={tier.id}
                                className={`p-10 bg-iron-950/30 border glass-panel flex flex-col hardened-border relative transition-all duration-500
                                    ${isOperator 
                                        ? 'border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.08)] scale-105 z-10' 
                                        : 'border-iron-800'}
                                    ${isCurrent ? 'bg-iron-900/50' : ''}`}
                            >
                                {isOperator && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-3 py-1 tracking-[0.3em] uppercase">
                                        Most Chosen
                                    </div>
                                )}

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
                                        <li key={feature} className={`flex items-start gap-3 text-xs uppercase tracking-widest font-mono 
                                            ${limitsHit ? 'line-through text-iron-800' : 'text-neutral-400'}`}>
                                            <span className="text-iron-600">▸</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => !isCurrent && handleUpgrade(tier.id)}
                                        disabled={isCurrent}
                                        className={`w-full py-4 font-bold font-display uppercase tracking-widest text-sm transition-all
                                            ${isCurrent
                                                ? 'bg-iron-900/50 text-red-900 border border-red-900/30 cursor-default'
                                                : isOperator
                                                    ? 'bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5'
                                                    : 'border border-iron-700 text-iron-200 hover:bg-white hover:text-black'
                                            }`}
                                    >
                                        {isCurrent ? 'Current Tier' : tier.cta}
                                    </button>
                                    
                                    {isOperator && (
                                        <p className="text-[9px] font-mono text-iron-600 text-center uppercase tracking-widest">
                                            743 operators initialized this month
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-32 space-y-12">
                    <p className="text-iron-700 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
                        // ENFORCEMENT IS LIVE. DRIFT IS RECORDED. UPGRADE TO ARM YOUR LOCKOUTS.
                    </p>
                    
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-iron-800 font-mono text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                    >
                        [ Return to System Node ]
                    </button>
                </div>
            </div>
        </div>
    );
};

