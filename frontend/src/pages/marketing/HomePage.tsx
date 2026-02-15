
import React from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import { Shield, TrendingUp, Users, Activity } from 'lucide-react';

const HomePage: React.FC = () => {
    return (
        <MarketingLayout>
            {/* Hero Section */}
            <section className="relative px-6 pt-32 pb-24 text-center overflow-hidden infrastructure-bg min-h-[70vh] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-iron-900/10 via-transparent to-black pointer-events-none" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-block mb-6 px-4 py-1.5 border border-iron-800 bg-iron-950/50 backdrop-blur-sm rounded-sm">
                        <span className="text-xs font-mono tracking-[0.3em] text-iron-500 uppercase">System Status: Active // Enforcement: Hard</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 font-display uppercase">
                        Discipline is <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-iron-400 via-white to-iron-500">
                            Infrastructure
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                        Stop relying on willpower. Iron-X codifies organizational governance into an operating system that <span className="text-white font-medium">precludes failure</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to="/register"
                            className="group relative bg-iron-100 text-black px-10 py-5 rounded-sm font-bold hover:bg-white transition-all w-full sm:w-auto overflow-hidden font-display text-lg uppercase tracking-wider"
                        >
                            <span className="relative z-10">Initialize Operator Node</span>
                            <div className="absolute inset-0 bg-iron-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </Link>
                        <Link
                            to="/roi-calculator"
                            className="px-10 py-5 rounded-sm font-bold text-white border border-iron-700 hover:bg-iron-800/50 transition-all w-full sm:w-auto font-display text-lg uppercase tracking-wider bg-iron-950/20 backdrop-blur-sm"
                        >
                            Launch ROI Engine
                        </Link>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-16 border-y border-iron-900 bg-black/50">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-[10px] font-mono text-iron-500 mb-10 uppercase tracking-[0.4em]">
                        Validated Infrastructure Clusters
                    </p>
                    <div className="flex flex-wrap justify-center gap-16 lg:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                        <span className="text-2xl font-bold font-display tracking-widest text-white">MEDI-CORE</span>
                        <span className="text-2xl font-bold font-display tracking-widest text-white">STRATOS CAPITAL</span>
                        <span className="text-2xl font-bold font-display tracking-widest text-white">APEX AUTO</span>
                        <span className="text-2xl font-bold font-display tracking-widest text-white">SENTRY SYSTEMS</span>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-40 px-6 bg-black infrastructure-grid-dense">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-iron-400" />}
                            title="Policy Enforcement"
                            description="Define rules that lock out users/systems until compliance checks are met."
                        />
                        <FeatureCard
                            icon={<Activity className="w-6 h-6 text-iron-400" />}
                            title="Identity Profiling"
                            description="Track behavioral drift across your entire organization in real-time."
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-iron-400" />}
                            title="Hierarchical Governance"
                            description="Set policies at the Org, Dept, or Team level with strict inheritance."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6 text-iron-400" />}
                            title="Audit-Ready Logs"
                            description="Every action, exception, and approval is logged for SOC 2 compliance."
                        />
                    </div>
                </div>
            </section>

            {/* Why Iron-X Section */}
            <section className="py-40 px-6 bg-neutral-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-iron-800 to-transparent" />
                <div className="max-w-5xl mx-auto relative z-10">
                    <h2 className="text-5xl md:text-6xl font-bold text-center mb-8 text-white font-display uppercase tracking-tight">
                        Why <span className="text-iron-400">Iron-X</span>?
                    </h2>
                    <p className="text-center text-neutral-400 mb-20 max-w-3xl mx-auto text-xl font-light leading-relaxed">
                        The name is a technical descriptor, not a brand metaphor. It signals infrastructure for organizations that treat discipline as an engineering problem.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
                        <div className="space-y-8">
                            <h3 className="text-3xl font-bold text-white font-display flex items-center gap-4 border-b border-iron-800 pb-4">
                                <span className="text-iron-500 font-mono text-xl">01</span> The "Iron" Component
                            </h3>
                            <div className="space-y-6">
                                <div className="pl-6 border-l border-iron-700">
                                    <h4 className="font-bold text-iron-200 mb-2 text-sm uppercase tracking-widest">Unyielding Material Properties</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-mono">Deterministic enforcement logic. Structural integrity under load. Immutability once deployed.</p>
                                </div>
                                <div className="pl-6 border-l border-iron-700">
                                    <h4 className="font-bold text-iron-200 mb-2 text-sm uppercase tracking-widest">Metallurgical Hardening</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-mono">Tempering soft intentions into hardened behavioral contracts through phase transformation.</p>
                                </div>
                                <div className="pl-6 border-l border-iron-700">
                                    <h4 className="font-bold text-iron-200 mb-2 text-sm uppercase tracking-widest">Industrial-Grade Infrastructure</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-mono">Load-bearing architecture for mission-critical operations. Built for permanence.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-3xl font-bold text-white font-display flex items-center gap-4 border-b border-iron-800 pb-4">
                                <span className="text-iron-500 font-mono text-xl">02</span> The "X" Component
                            </h3>
                            <div className="space-y-6">
                                <div className="pl-6 border-l border-iron-700">
                                    <h4 className="font-bold text-iron-200 mb-2 text-sm uppercase tracking-widest">Variable Placeholder</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-mono">X represents the compliance gap—the delta between current state and required state.</p>
                                </div>
                                <div className="pl-6 border-l border-iron-700">
                                    <h4 className="font-bold text-iron-200 mb-2 text-sm uppercase tracking-widest">Execution Marker</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-mono">The checkbox symbol. Every X generates an immutable audit log entry.</p>
                                </div>
                                <div className="pl-6 border-l border-iron-700">
                                    <h4 className="font-bold text-iron-200 mb-2 text-sm uppercase tracking-widest">Cross-Domain Intersection</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed font-mono">Auth × Discipline × Enforcement. Individual × Team × Organization.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-iron-800 rounded-sm p-10 hardened-border">
                        <h4 className="text-xs font-mono text-iron-500 mb-6 uppercase tracking-[0.3em]">Technical Specification // v1.0.4</h4>
                        <pre className="text-lg text-iron-300 overflow-x-auto font-mono py-4 leading-relaxed">
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
            <section className="py-40 px-6 bg-black border-y border-iron-900 infrastructure-bg">
                <div className="max-w-5xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white font-display uppercase tracking-wider">
                        What Iron-X <span className="text-red-600">Is Not</span>
                    </h2>
                    <p className="text-center text-neutral-400 mb-20 max-w-2xl mx-auto font-light leading-relaxed">
                        We explicitly reject patterns that treat discipline as a motivation problem. Iron-X is built for governance.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FailCard title="Not Motivational" desc="No 'Achieve' or 'Empower'. We enforce, not inspire." />
                        <FailCard title="Not Productivity" desc="Not a 'planner' or 'habit tracker'. This is infrastructure." />
                        <FailCard title="Not Wellness" desc="No mindfulness or self-care framing. This is professional ethics." />
                        <FailCard title="Not Gamified" desc="No points or levels. Compliance is binary, not scored." />
                    </div>

                    <div className="mt-16 p-10 rounded-sm bg-iron-950 border border-iron-700/50 flex items-center justify-center text-center">
                        <div>
                            <p className="text-2xl text-iron-200 font-display uppercase tracking-widest mb-2 italic">
                                "If a user can violate a policy, the <span className="text-white font-bold">system failed</span>, not the user."
                            </p>
                            <p className="text-[10px] font-mono text-iron-500 uppercase tracking-widest">— The No-Blame Principle / Axiom 01</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-32 px-6 bg-gradient-to-b from-neutral-950 to-black">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
                        How It Works
                    </h2>
                    <p className="text-center text-neutral-400 mb-20 max-w-2xl mx-auto">
                        Three deterministic steps to structural discipline enforcement
                    </p>

                    <div className="space-y-16">
                        {/* Step 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-iron-700 flex items-center justify-center text-white font-bold text-xl">1</div>
                                    <h3 className="text-2xl font-bold text-white">Define Policies</h3>
                                </div>
                                <p className="text-neutral-300 mb-6">
                                    Establish binding governance rules at the organizational, departmental, or team level
                                </p>
                                <ul className="space-y-3 text-neutral-400">
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Set action frequency requirements and deadline constraints</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Configure enforcement modes (SOFT warnings or HARD lockouts)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Define hierarchical inheritance rules for policy cascading</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="order-1 md:order-2 bg-neutral-900/50 border border-iron-800 rounded-2xl p-8 h-64 flex items-center justify-center">
                                <p className="text-neutral-500 font-mono text-sm">[Policy Configuration Interface]</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="bg-neutral-900/50 border border-iron-800 rounded-2xl p-8 h-64 flex items-center justify-center">
                                <p className="text-neutral-500 font-mono text-sm">[Real-Time Compliance Dashboard]</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-iron-700 flex items-center justify-center text-white font-bold text-xl">2</div>
                                    <h3 className="text-2xl font-bold text-white">Monitor Compliance</h3>
                                </div>
                                <p className="text-neutral-300 mb-6">
                                    Track behavioral drift and policy violations across your entire organization in real-time
                                </p>
                                <ul className="space-y-3 text-neutral-400">
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Identity profiling shows each user's compliance trajectory</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Predictive violation horizon alerts before lockouts occur</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Immutable audit logs for SOC 2 and regulatory compliance</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-iron-700 flex items-center justify-center text-white font-bold text-xl">3</div>
                                    <h3 className="text-2xl font-bold text-white">Enforce Automatically</h3>
                                </div>
                                <p className="text-neutral-300 mb-6">
                                    The system executes non-negotiable consequences when policies are violated
                                </p>
                                <ul className="space-y-3 text-neutral-400">
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Hard mode locks out users/systems until compliance is restored</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Soft mode provides escalating warnings with deadline countdowns</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-iron-400 mt-1">▸</span>
                                        <span>Exception requests require manager approval with audit trail</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="order-1 md:order-2 bg-neutral-900/50 border border-iron-800 rounded-2xl p-8 h-64 flex items-center justify-center">
                                <p className="text-neutral-500 font-mono text-sm">[Enforcement Execution Engine]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-32 px-6 bg-black border-y border-neutral-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
                        Trusted by High-Performance Organizations
                    </h2>
                    <p className="text-center text-neutral-400 mb-20 max-w-2xl mx-auto">
                        Organizations that refuse to fail choose Iron-X
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Testimonial Placeholder 1 */}
                        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                            <div className="mb-6">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-iron-400">★</span>
                                    ))}
                                </div>
                                <p className="text-neutral-300 italic mb-6">
                                    "[Customer testimonial highlighting ROI, time savings, or compliance improvements]"
                                </p>
                            </div>
                            <div className="border-t border-neutral-800 pt-6">
                                <p className="font-bold text-white">[Customer Name]</p>
                                <p className="text-sm text-neutral-500">[Title, Company]</p>
                            </div>
                        </div>

                        {/* Testimonial Placeholder 2 */}
                        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                            <div className="mb-6">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-iron-400">★</span>
                                    ))}
                                </div>
                                <p className="text-neutral-300 italic mb-6">
                                    "[Customer testimonial highlighting enforcement effectiveness or behavioral transformation]"
                                </p>
                            </div>
                            <div className="border-t border-neutral-800 pt-6">
                                <p className="font-bold text-white">[Customer Name]</p>
                                <p className="text-sm text-neutral-500">[Title, Company]</p>
                            </div>
                        </div>

                        {/* Testimonial Placeholder 3 */}
                        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800">
                            <div className="mb-6">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-iron-400">★</span>
                                    ))}
                                </div>
                                <p className="text-neutral-300 italic mb-6">
                                    "[Customer testimonial highlighting system reliability or audit readiness]"
                                </p>
                            </div>
                            <div className="border-t border-neutral-800 pt-6">
                                <p className="font-bold text-white">[Customer Name]</p>
                                <p className="text-sm text-neutral-500">[Title, Company]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-40 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-5xl md:text-6xl font-bold text-center mb-8 text-white font-display uppercase tracking-tight">
                        Infrastructure Licensing
                    </h2>
                    <p className="text-center text-neutral-400 mb-24 max-w-2xl mx-auto font-light leading-relaxed text-xl">
                        Scale from node evaluation to distributed institutional governance.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* EVAL Tier */}
                        <div className="p-10 rounded-sm bg-neutral-900/30 border border-iron-800 glass-panel flex flex-col">
                            <div className="mb-10">
                                <h3 className="text-xs font-mono text-iron-500 mb-4 uppercase tracking-[0.4em]">Node Evaluation</h3>
                                <div className="text-4xl font-bold text-white mb-2 font-display uppercase">EVAL</div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-3xl font-bold text-white font-display">$0</span>
                                    <span className="text-xs font-mono text-iron-500 uppercase">/ node</span>
                                </div>
                                <p className="text-sm text-neutral-400 leading-relaxed font-light">Preliminary testing of discipline enforcement architecture.</p>
                            </div>
                            <ul className="space-y-4 mb-10 flex-grow border-t border-iron-800 pt-8">
                                <PricingFeature text="Max 3 Actions / Node" />
                                <PricingFeature text="SOFT Enforcement" />
                                <PricingFeature text="Basic Compliance Engine" />
                                <PricingFeature text="Local Audit Stream" />
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center px-6 py-4 rounded-sm border border-iron-700 text-iron-200 hover:bg-white hover:text-black transition-all font-display uppercase tracking-widest text-sm"
                            >
                                Start Evaluation
                            </Link>
                        </div>

                        {/* OPERATOR Tier */}
                        <div className="p-10 rounded-sm bg-iron-950/50 border-2 border-iron-400 glass-panel relative flex flex-col transform lg:-translate-y-4 shadow-2xl shadow-iron-500/10">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-iron-400 text-black px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em]">
                                Standard Deploy
                            </div>
                            <div className="mb-10">
                                <h3 className="text-xs font-mono text-iron-500 mb-4 uppercase tracking-[0.4em]">Mission-Critical Node</h3>
                                <div className="text-4xl font-bold text-white mb-2 font-display uppercase">OPERATOR</div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-3xl font-bold text-white font-display">$49</span>
                                    <span className="text-xs font-mono text-iron-500 uppercase">/ node / mo</span>
                                </div>
                                <p className="text-sm text-neutral-400 leading-relaxed font-light">Hard enforcement for individual operational performance.</p>
                            </div>
                            <ul className="space-y-4 mb-10 flex-grow border-t border-iron-800 pt-8">
                                <PricingFeature active text="Unlimited Actions" />
                                <PricingFeature active text="HARD Enforcement (Lockouts)" />
                                <PricingFeature active text="Discipline Trajectory Engine" />
                                <PricingFeature active text="90-Day Audit Retention" />
                                <PricingFeature active text="Operational API Access" />
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center px-6 py-4 rounded-sm bg-iron-100 text-black hover:bg-white transition-all font-bold font-display uppercase tracking-widest text-sm"
                            >
                                Initialize Node
                            </Link>
                        </div>

                        {/* INSTITUTIONAL Tier */}
                        <div className="p-10 rounded-sm bg-neutral-900/30 border border-iron-800 glass-panel flex flex-col">
                            <div className="mb-10">
                                <h3 className="text-xs font-mono text-iron-500 mb-4 uppercase tracking-[0.4em]">Governance Cluster</h3>
                                <div className="text-4xl font-bold text-white mb-2 font-display uppercase">INSTITUTIONAL</div>
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-3xl font-bold text-white font-display">CUSTOM</span>
                                </div>
                                <p className="text-sm text-neutral-400 leading-relaxed font-light">Distributed governance for complex organizational clusters.</p>
                            </div>
                            <ul className="space-y-4 mb-10 flex-grow border-t border-iron-800 pt-8">
                                <PricingFeature text="Institutional Policy Clusters" />
                                <PricingFeature text="Immutable Audit Protocol" />
                                <PricingFeature text="SAML / Architecture SSO" />
                                <PricingFeature text="Dedicated System Analyst" />
                                <PricingFeature text="On-Premise Resilience" />
                            </ul>
                            <a
                                href="mailto:enterprise@iron-x.com"
                                className="block w-full text-center px-6 py-4 rounded-sm border border-iron-700 text-iron-200 hover:bg-white hover:text-black transition-all font-display uppercase tracking-widest text-sm"
                            >
                                Contact Architecture
                            </a>
                        </div>
                    </div>

                    <div className="mt-24 text-center">
                        <p className="text-[10px] font-mono text-iron-600 uppercase tracking-[0.4em]">
                            Encryption: AES-256 // Compliance: SOC 2 TYPE II Ready // SLA: 99.99%
                        </p>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-10 rounded-sm bg-neutral-900/20 border border-iron-900 hardened-border hover:bg-iron-900/40 transition-all group">
        <div className="mb-6 opacity-50 group-hover:opacity-100 transition-opacity">{icon}</div>
        <h3 className="text-lg font-bold mb-3 text-white font-display uppercase tracking-wider">{title}</h3>
        <p className="text-sm text-neutral-500 leading-relaxed font-light">{description}</p>
    </div>
);

const FailCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div className="p-8 rounded-sm bg-iron-950/50 border border-iron-900 flex items-start gap-4 hover:border-iron-700 transition-colors">
        <div className="w-2 h-2 rounded-full bg-red-600 mt-2 flex-shrink-0 animate-pulse" />
        <div>
            <h3 className="font-bold text-iron-200 mb-1 font-display uppercase tracking-widest text-sm">{title}</h3>
            <p className="text-xs text-neutral-500 font-mono leading-relaxed">{desc}</p>
        </div>
    </div>
);

const PricingFeature: React.FC<{ text: string, active?: boolean }> = ({ text, active }) => (
    <li className={`flex items-start gap-3 text-xs uppercase tracking-widest font-mono ${active ? 'text-iron-200' : 'text-iron-500'}`}>
        <span className={`${active ? 'text-iron-400' : 'text-iron-800'}`}>▸</span>
        {text}
    </li>
);

export default HomePage;
