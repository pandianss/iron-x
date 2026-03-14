
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { BillingClient } from '../domain/billing';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
    resource: 'ACTIONS' | 'GOALS' | 'TEAMS' | 'WEBHOOKS' | 'API_KEYS';
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ resource, onClose }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleUpgrade = async () => {
        try {
            const { url } = await BillingClient.createCheckoutSession(
                'price_pro_monthly',
                window.location.href,
                window.location.href
            );
            if (url) {
                window.location.assign(url);
            }
        } catch (err) {
            console.error('Checkout error:', err);
        }
    };

    const resourceLabels: Record<string, string> = {
        ACTIONS: 'Action',
        GOALS: 'Goal',
        TEAMS: 'Team',
        WEBHOOKS: 'Webhook',
        API_KEYS: 'API Key'
    };

    const resourceLimits: Record<string, string> = {
        ACTIONS: '3 Actions',
        GOALS: '3 Goals',
        TEAMS: '1 Team',
        WEBHOOKS: '0 Webhooks',
        API_KEYS: '0 API Keys'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-black border border-iron-800 p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] hardened-border">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-iron-600 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-xs font-mono text-iron-500 uppercase tracking-[0.4em] mb-4">Quota Exhausted</h2>
                    <h3 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-tight text-white">
                        {resourceLabels[resource]} Limit Reached
                    </h3>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-mono text-red-500 uppercase tracking-widest border-b border-red-900/30 pb-2">EVAL NODE (Current)</h4>
                        <ul className="space-y-2 text-[10px] font-mono text-iron-600 uppercase">
                            <li className="line-through">{resourceLimits[resource]} Max</li>
                            <li>Soft Enforcement</li>
                            <li>No API Access</li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-mono text-green-500 uppercase tracking-widest border-b border-green-900/30 pb-2">OPERATOR NODE</h4>
                        <ul className="space-y-2 text-[10px] font-mono text-iron-300 uppercase">
                            <li>Unlimited {resourceLabels[resource]}s</li>
                            <li>HARD Enforcement</li>
                            <li>Full API Access</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleUpgrade}
                        className="w-full py-4 bg-white text-black font-bold font-display uppercase tracking-widest text-sm hover:bg-iron-200 transition-all shadow-lg shadow-white/5 active:scale-[0.98]"
                    >
                        Initialize OPERATOR Node — $49/mo
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            navigate('/pricing');
                        }}
                        className="w-full py-3 border border-iron-800 text-iron-500 font-mono text-[10px] uppercase tracking-[0.3em] hover:text-white hover:border-iron-600 transition-all"
                    >
                        [ View Full Pricing ]
                    </button>
                </div>

                <p className="mt-8 text-center text-[9px] font-mono text-iron-700 uppercase leading-relaxed">
                    // Deployment of mission-critical discipline infrastructure requires an active operator license.
                    <br />
                    // All drift is recorded.
                </p>
            </div>
        </div>
    );
};

export default UpgradeModal;
