
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
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a1a1aa] to-[#f4f4f5]">
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
            <section className="py-32 px-6 bg-gradient-to-b from-black to-neutral-950">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
                        Choose Your Enforcement Level
                    </h2>
                    <p className="text-center text-neutral-400 mb-20 max-w-2xl mx-auto">
                        Start with soft enforcement, scale to hard lockouts as your organization matures
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* FREE Tier */}
                        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-iron-700 transition-all">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">FREE</h3>
                                <p className="text-neutral-400 mb-6">For individuals exploring discipline systems</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">$0</span>
                                    <span className="text-neutral-500">/month</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Up to 3 actions per month</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>SOFT enforcement mode only</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Basic compliance dashboard</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>7-day audit log retention</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Community support</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center px-6 py-3 rounded-lg border border-neutral-700 text-white hover:bg-neutral-900 transition-colors"
                            >
                                Start Free
                            </Link>
                        </div>

                        {/* PRO Tier */}
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-iron-900/20 to-neutral-900 border-2 border-iron-600 hover:border-iron-500 transition-all relative">
                            <div className="absolute -top-4 left-1/2 -traniron-x-1/2 bg-iron-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                                MOST POPULAR
                            </div>
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
                                <p className="text-neutral-400 mb-6">For teams enforcing operational discipline</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">$49</span>
                                    <span className="text-neutral-500">/user/month</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Unlimited actions</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>HARD enforcement mode (lockouts)</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Advanced trajectory analytics</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>90-day audit log retention</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Team collaboration (up to 10 users)</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Priority email support</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>API access</span>
                                </li>
                            </ul>
                            <Link
                                to="/register"
                                className="block w-full text-center px-6 py-3 rounded-lg bg-iron-600 text-white hover:bg-iron-500 transition-colors font-bold"
                            >
                                Start Pro Trial
                            </Link>
                        </div>

                        {/* ENTERPRISE Tier */}
                        <div className="p-8 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-iron-700 transition-all">
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white mb-2">ENTERPRISE</h3>
                                <p className="text-neutral-400 mb-6">For organizations requiring institutional governance</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-white">Custom</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Everything in PRO</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Unlimited users</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>SSO & SAML authentication</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Unlimited audit log retention</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Dedicated account manager</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>Custom SLA & uptime guarantees</span>
                                </li>
                                <li className="flex items-start gap-3 text-neutral-300">
                                    <span className="text-iron-400 mt-1">✓</span>
                                    <span>On-premise deployment option</span>
                                </li>
                            </ul>
                            <a
                                href="mailto:enterprise@iron-x.com"
                                className="block w-full text-center px-6 py-3 rounded-lg border border-neutral-700 text-white hover:bg-neutral-900 transition-colors"
                            >
                                Contact Sales
                            </a>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <p className="text-neutral-500 text-sm">
                            All plans include SOC 2 Type II compliance, 99.9% uptime SLA, and encrypted data storage
                        </p>
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
