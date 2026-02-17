
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BillingClient, type Subscription } from '../domain/billing';
import { CreditCard, Shield, Activity, CheckCircle } from 'lucide-react';

declare const Razorpay: any;

export default function BillingPortalPage() {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
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

    const handleRazorpayCheckout = async () => {
        try {
            // 1. Create subscription on backend
            // For MVP, we use a mock plan ID. In prod, this would come from a plan selection.
            const planId = 'plan_PRG9v8N9oQy0Yh'; // Example plan ID
            const subscriptionData = await BillingClient.createRazorpaySubscription(planId);

            // 2. Launch Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock_id',
                subscription_id: subscriptionData.id,
                name: 'Iron-X Discipline',
                description: 'Monthly Discipline Infrastructure Subscription',
                image: '/vite.svg',
                handler: async function (response: any) {
                    // 3. Verify payment on backend
                    try {
                        await BillingClient.verifyRazorpayPayment(response);
                        alert('Payment Successful! Your subscription is now active.');
                        window.location.reload();
                    } catch (err) {
                        console.error('Verification failed', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.email.split('@')[0],
                    email: user?.email,
                },
                theme: {
                    color: '#000000',
                },
            };

            const rzp = new Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Checkout error', error);
            alert('Failed to initialize checkout. Please try again.');
        }
    };

    if (loading) return <div className="p-8 text-white text-center font-mono">AUTHENTICATING_ACCOUNT...</div>;

    return (
        <div className="min-h-screen bg-black text-iron-200 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 border-b border-iron-900 pb-8">
                    <h1 className="text-4xl font-bold text-white uppercase tracking-tighter mb-2">Operational Tier & Billing</h1>
                    <p className="text-iron-500 font-mono text-sm">MANAGE_SUBSCRIPTION_CORE_MODULE</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Active Plan Card */}
                    <div className="bg-iron-950 border border-iron-900 rounded-none p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-24 h-24 text-white" />
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <span className={`px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest border ${subscription?.is_active ? 'bg-white text-black border-white' : 'bg-red-950 text-red-500 border-red-900'}`}>
                                {subscription?.is_active ? 'SYSTEM_ACTIVE' : 'SYSTEM_INACTIVE'}
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">
                            {subscription?.plan_tier || 'FREE'} PROTOCOL
                        </h2>
                        <p className="text-sm text-iron-500 mb-8 font-mono italic">"Integrity through consistent enforcement."</p>

                        {!subscription?.is_active ? (
                            <button
                                onClick={handleRazorpayCheckout}
                                className="w-full py-4 px-6 bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-iron-200 transition-all flex items-center justify-center gap-3"
                            >
                                <CreditCard className="w-4 h-4 stroke-[3]" />
                                Initialize Pro Tier
                            </button>
                        ) : (
                            <div className="text-iron-600 text-[10px] font-mono uppercase tracking-widest border-t border-iron-900 pt-4">
                                Subscription managed via automated node.
                            </div>
                        )}
                    </div>

                    {/* Quota Usage Card */}
                    <div className="bg-iron-950 border border-iron-900 rounded-none p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                                <Activity className="w-8 h-8 text-iron-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight text-right">Resource Quotas</h2>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <span className="text-iron-500">Action Vectors</span>
                                    <span className="text-white">NODE_LIMIT: {subscription?.plan_tier === 'FREE' ? '3' : 'UNLIMITED'}</span>
                                </div>
                                <div className="h-1 bg-iron-900 overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-1000"
                                        style={{ width: subscription?.plan_tier === 'FREE' ? '33%' : '100%' }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <span className="text-iron-500">Goal Parameters</span>
                                    <span className="text-white">NODE_LIMIT: {subscription?.plan_tier === 'FREE' ? '3' : 'UNLIMITED'}</span>
                                </div>
                                <div className="h-1 bg-iron-900 overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-1000"
                                        style={{ width: subscription?.plan_tier === 'FREE' ? '25%' : '100%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Status / Alerts */}
                {subscription?.is_locked && (
                    <div className="bg-red-950/20 border border-red-900/50 p-6 flex items-start gap-5 mb-12 animate-pulse">
                        <div className="p-3 bg-red-900/40 rounded-sm">
                            <Shield className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">LOCKOUT_WARNING_DETECTION</p>
                            <p className="text-xs text-red-900/80 font-mono leading-relaxed">
                                System integrity compromised due to failed reconciliation. Update payment vector immediately to maintain node operationality.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-iron-950/50 border border-iron-900 rounded-none hover:border-iron-700 transition-colors pointer-events-none opacity-40">
                        <CheckCircle className="w-5 h-5 text-iron-700 mb-4" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">History Log</h3>
                        <p className="text-[10px] text-iron-600 font-mono uppercase">ARCHIVE_INACCESSIBLE_IN_MVP</p>
                    </div>
                    <div className="p-6 bg-iron-950/50 border border-iron-900 rounded-none hover:border-iron-700 transition-colors pointer-events-none opacity-40">
                        <CheckCircle className="w-5 h-5 text-iron-700 mb-4" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Vectors</h3>
                        <p className="text-[10px] text-iron-600 font-mono uppercase">CREDIT_CARD_PRIMARY_ONLY</p>
                    </div>
                    <div className="p-6 bg-iron-950/50 border border-iron-900 rounded-none hover:border-iron-700 transition-colors pointer-events-none opacity-40">
                        <CheckCircle className="w-5 h-5 text-iron-700 mb-4" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Strategic ID</h3>
                        <p className="text-[10px] text-iron-600 font-mono uppercase">TAX_NOT_CONFIGURED</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

