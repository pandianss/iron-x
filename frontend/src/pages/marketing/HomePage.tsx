
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

            {/* Why Iron-X Section */}
            <section className="py-32 px-6 bg-gradient-to-b from-black to-neutral-950">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
                        Why <span className="text-iron-400">Iron-X</span>?
                    </h2>
                    <p className="text-center text-neutral-400 mb-16 max-w-3xl mx-auto text-lg">
                        The name is a technical descriptor, not a brand metaphor. It signals infrastructure for organizations that treat discipline as an engineering problem.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-iron-300 flex items-center gap-3">
                                <span className="text-3xl">⚙️</span> The "Iron" Component
                            </h3>
                            <div className="space-y-4 text-neutral-300">
                                <div className="pl-6 border-l-2 border-iron-700">
                                    <h4 className="font-bold text-white mb-2">Unyielding Material Properties</h4>
                                    <p className="text-sm text-neutral-400">Deterministic enforcement logic. Structural integrity under load. Immutability once deployed.</p>
                                </div>
                                <div className="pl-6 border-l-2 border-iron-700">
                                    <h4 className="font-bold text-white mb-2">Metallurgical Hardening</h4>
                                    <p className="text-sm text-neutral-400">Tempering soft intentions into hardened behavioral contracts through phase transformation.</p>
                                </div>
                                <div className="pl-6 border-l-2 border-iron-700">
                                    <h4 className="font-bold text-white mb-2">Industrial-Grade Infrastructure</h4>
                                    <p className="text-sm text-neutral-400">Load-bearing architecture for mission-critical operations. Built for permanence, not ephemeral usage.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-iron-300 flex items-center gap-3">
                                <span className="text-3xl">✕</span> The "X" Component
                            </h3>
                            <div className="space-y-4 text-neutral-300">
                                <div className="pl-6 border-l-2 border-iron-700">
                                    <h4 className="font-bold text-white mb-2">Variable Placeholder</h4>
                                    <p className="text-sm text-neutral-400">X represents the compliance gap—the delta between current state and required state.</p>
                                </div>
                                <div className="pl-6 border-l-2 border-iron-700">
                                    <h4 className="font-bold text-white mb-2">Execution Marker</h4>
                                    <p className="text-sm text-neutral-400">The checkbox symbol. Every X generates an immutable audit log entry.</p>
                                </div>
                                <div className="pl-6 border-l-2 border-iron-700">
                                    <h4 className="font-bold text-white mb-2">Cross-Domain Intersection</h4>
                                    <p className="text-sm text-neutral-400">Auth × Discipline × Enforcement. Individual × Team × Organization.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 border border-iron-800 rounded-2xl p-8">
                        <h4 className="text-xl font-bold text-white mb-4 font-mono">Technical Specification</h4>
                        <pre className="text-sm text-iron-300 overflow-x-auto">
                            {`Iron-X := {
  Enforcement_Mode ∈ {SOFT, HARD},
  Policy_Set := P₁, P₂, ..., Pₙ,
  Identity_Profile := Behavioral_Drift_Function(t),
  Compliance_State := Boolean_Gate_Logic(),
  Audit_Log := Immutable_Event_Stream
}

Where: ∀ policy p ∈ Policy_Set,
       Execution_Allowed ⟺ Compliance_Check(p) = TRUE`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* What We're NOT Section */}
            <section className="py-32 px-6 bg-black border-y border-neutral-900">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
                        What Iron-X <span className="text-red-500">Is Not</span>
                    </h2>
                    <p className="text-center text-neutral-400 mb-16 max-w-2xl mx-auto">
                        We explicitly reject patterns that treat discipline as a motivation problem.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">❌</span>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Not Motivational Software</h3>
                                    <p className="text-sm text-neutral-400">No "Achieve", "Elevate", or "Empower". We enforce, not inspire.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">❌</span>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Not a Productivity Tracker</h3>
                                    <p className="text-sm text-neutral-400">Not a "planner", "organizer", or "habit tracker". This is governance infrastructure.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">❌</span>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Not Wellness Software</h3>
                                    <p className="text-sm text-neutral-400">No mindfulness, self-care, or personal growth framing. This is professional ethics.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">❌</span>
                                <div>
                                    <h3 className="font-bold text-white mb-2">Not Gamified</h3>
                                    <p className="text-sm text-neutral-400">No points, levels, or achievements. Compliance is binary, not scored.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-iron-900/20 to-neutral-950 border border-iron-700">
                        <p className="text-center text-lg text-iron-200 font-medium">
                            "If a user can violate a policy, the <span className="text-white font-bold">system failed</span>, not the user."
                        </p>
                        <p className="text-center text-sm text-neutral-500 mt-2">— The No-Blame Principle</p>
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
