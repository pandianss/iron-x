
import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import { Shield, TrendingUp, Users, Activity } from 'lucide-react';

const HomePage: React.FC = () => {
    return (
        <MarketingLayout>
            {/* Hero Section */}
            <section className="relative px-6 pt-32 pb-24 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-iron-900/20 to-black pointer-events-none" />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                        Discipline is <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-iron-400 to-iron-100">
                            Infrastructure
                        </span>
                    </h1>
                    <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
                        Stop relying on willpower. Iron-X codifies your organization's governance into an operating system that refuses to let you fail.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/register"
                            className="bg-iron-100 text-black px-8 py-4 rounded-lg font-bold hover:bg-white transition-colors w-full sm:w-auto"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            to="/roi-calculator"
                            className="px-8 py-4 rounded-lg font-bold text-white border border-neutral-700 hover:bg-neutral-900 transition-colors w-full sm:w-auto"
                        >
                            Calculate ROI
                        </Link>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 border-y border-neutral-900 bg-neutral-950/50">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm font-mono text-neutral-500 mb-8 uppercase tracking-widest">
                        Trusted by high-performance teams at
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Placeholders for logos */}
                        <span className="text-2xl font-bold text-neutral-300">MEDI-CORE</span>
                        <span className="text-2xl font-bold text-neutral-300">STRATOS CAPITAL</span>
                        <span className="text-2xl font-bold text-neutral-300">APEX AUTO</span>
                        <span className="text-2xl font-bold text-neutral-300">SENTRY SYSTEMS</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-iron-400" />}
                            title="Policy Enforcement"
                            description="Define rules that lock out users/systems until compliance checks are met."
                        />
                        <FeatureCard
                            icon={<Activity className="w-8 h-8 text-iron-400" />}
                            title="Identity Profiling"
                            description="Track behavioral drift across your entire organization in real-time."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-iron-400" />}
                            title="Hierarchical Governance"
                            description="Set policies at the Org, Dept, or Team level with strict inheritance."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-iron-400" />}
                            title="Audit-Ready Logs"
                            description="Every action, exception, and approval is logged for SOC 2 compliance."
                        />
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-iron-700 transition-colors">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-neutral-400 leading-relaxed">{description}</p>
    </div>
);

export default HomePage;
