 

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BillingClient } from '../domain/billing';
import { CreditCard, Shield, Activity, CheckCircle } from 'lucide-react';

const BillingPortalPage: React.FC = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchSub = async () => {
            if (user?.id) {
                const s = await BillingClient.getSubscription();
                setSubscription(s);
            }
            setLoading(false);
        };
        fetchSub();
    }, [user]);

    const handleManageBilling = async () => {
        try {
            const session = await BillingClient.createPortalSession();
            if (session.url) window.location.href = session.url;
        } catch (error) {
            console.error('Portal session error', error);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-iron-950 text-iron-200 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
                    <p className="text-iron-400">Manage your plan, payment methods, and monitor resource usage.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Active Plan Card */}
                    <div className="bg-iron-900 border border-iron-800 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                                ACTIVE
                            </span>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-1">
                            {subscription?.plan_tier || 'FREE'} Tier
                        </h2>
                        <p className="text-sm text-iron-400 mb-6">Your current active subscription plan.</p>

                        <button
                            onClick={handleManageBilling}
                            className="w-full py-3 px-4 bg-iron-800 hover:bg-iron-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <CreditCard className="w-4 h-4" />
                            Manage via Stripe Portal
                        </button>
                    </div>

                    {/* Quota Usage Card */}
                    <div className="bg-iron-900 border border-iron-800 rounded-xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Activity className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-4">Resource Quotas</h2>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-iron-400">Actions</span>
                                    <span className="text-white">-- / {subscription?.plan_tier === 'FREE' ? '3' : '∞'}</span>
                                </div>
                                <div className="h-2 bg-iron-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-1/3"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-iron-400">Goals</span>
                                    <span className="text-white">-- / {subscription?.plan_tier === 'FREE' ? '3' : '∞'}</span>
                                </div>
                                <div className="h-2 bg-iron-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-1/4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Status / Alerts */}
                {subscription?.is_locked && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-4 mb-8">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Shield className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Payment Required</p>
                            <p className="text-sm text-red-200/60">
                                Your account is currently in a grace period. Please update your payment method to avoid loss of access.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-iron-900/50 border border-iron-800 rounded-lg hover:border-iron-700 transition-colors pointer-events-none opacity-50">
                        <CheckCircle className="w-5 h-5 text-iron-500 mb-2" />
                        <h3 className="text-sm font-medium text-white">Invoices</h3>
                        <p className="text-xs text-iron-500">View past payment history.</p>
                    </div>
                    <div className="p-4 bg-iron-900/50 border border-iron-800 rounded-lg hover:border-iron-700 transition-colors pointer-events-none opacity-50">
                        <CheckCircle className="w-5 h-5 text-iron-500 mb-2" />
                        <h3 className="text-sm font-medium text-white">Payment Methods</h3>
                        <p className="text-xs text-iron-500">Update credit card details.</p>
                    </div>
                    <div className="p-4 bg-iron-900/50 border border-iron-800 rounded-lg hover:border-iron-700 transition-colors pointer-events-none opacity-50">
                        <CheckCircle className="w-5 h-5 text-iron-500 mb-2" />
                        <h3 className="text-sm font-medium text-white">Tax ID</h3>
                        <p className="text-xs text-iron-500">Manage business tax info.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPortalPage;
