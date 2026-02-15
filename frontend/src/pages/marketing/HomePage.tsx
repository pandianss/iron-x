
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import { Activity, Lock, Target, Server, FileText, ChevronRight, AlertCircle, Users } from 'lucide-react';

const HomePage: React.FC = () => {
    return (
        <MarketingLayout>
            {/* 1. HERO SECTION */}
            <section className="relative px-6 pt-40 pb-32 text-center overflow-hidden infrastructure-bg min-h-[80vh] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-iron-900/10 via-transparent to-black pointer-events-none" />
                <div className="relative z-10 max-w-5xl mx-auto">
                    <div className="inline-block mb-8 px-4 py-1.5 border border-iron-800 bg-iron-950/50 backdrop-blur-sm rounded-sm">
                        <span className="text-xs font-mono tracking-[0.3em] text-iron-500 uppercase">Status: Operational // Layer: Governance</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 font-display uppercase leading-[0.9]">
                        Governance Layer <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-iron-500 via-white to-iron-400">
                            for Execution Systems
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed font-mono">
                        Iron-X removes negotiation from your operating loop. Stop relying on willpower. Codify discipline.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            to="/register"
                            className="group relative bg-white text-black px-12 py-5 rounded-sm font-bold hover:bg-neutral-200 transition-all w-full sm:w-auto overflow-hidden font-display text-lg uppercase tracking-wider"
                        >
                            <span className="relative z-10">Initialize System</span>
                        </Link>
                        <a
                            href="#architecture"
                            className="px-12 py-5 rounded-sm font-bold text-white border border-iron-800 hover:bg-iron-900/50 transition-all w-full sm:w-auto font-display text-lg uppercase tracking-wider bg-iron-950/20 backdrop-blur-sm"
                        >
                            Review Architecture
                        </a>
                    </div>
                </div>
            </section>

            {/* 2. SYSTEM ORIENTATION */}
            <section className="py-32 px-6 bg-black border-y border-iron-900 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white font-display uppercase tracking-widest mb-8">
                        This is not a productivity tool. <br />
                        <span className="text-iron-500">It is a governance layer.</span>
                    </h2>
                    <p className="text-lg text-neutral-500 mb-16 font-mono leading-relaxed max-w-2xl mx-auto">
                        Iron-X exists for operators who want enforcement, not encouragement. If you are seeking reminders or motivational streaks, this system will feel excessive.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                        <div className="space-y-6">
                            <h3 className="text-xs font-mono text-iron-400 uppercase tracking-[0.3em] border-b border-iron-900 pb-2">Iron-X is designed for:</h3>
                            <ul className="space-y-4">
                                <SelectionItem text="Builders managing cognitive drift" />
                                <SelectionItem text="Operators running execution systems" />
                                <SelectionItem text="Individuals who prefer rules over willpower" />
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-xs font-mono text-red-900 uppercase tracking-[0.3em] border-b border-red-950 pb-2">Iron-X rejects:</h3>
                            <ul className="space-y-4 opacity-60">
                                <RejectionItem text="Passive tracking" />
                                <RejectionItem text="Soft accountability" />
                                <RejectionItem text="Habit gamification" />
                                <RejectionItem text="Emotional dependency loops" />
                            </ul>
                        </div>
                    </div>

                    <div className="mt-20">
                        <Link to="/register" className="text-iron-400 font-mono text-sm uppercase tracking-widest hover:text-white transition-colors group">
                            Enter System Model <span className="inline-block transform group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. ENFORCEMENT MECHANISM */}
            <section id="mechanism" className="py-40 px-6 bg-neutral-950">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-24 text-center">
                        <h2 className="text-5xl md:text-6xl font-bold text-white font-display uppercase mb-6">How Iron-X Works</h2>
                        <p className="text-xl text-neutral-500 font-mono">Most systems measure behavior. Iron-X intervenes.</p>
                    </div>

                    <div className="relative">
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-iron-900 -translate-x-1/2" />

                        <div className="space-y-24">
                            <MechanismStep
                                number="01"
                                title="Drift Detection"
                                desc="Iron-X observes deviation from declared discipline parameters in real-time."
                                side="left"
                            />
                            <MechanismStep
                                number="02"
                                title="Policy Resolution"
                                desc="The system evaluates predefined enforcement rules against current state."
                                side="right"
                            />
                            <MechanismStep
                                number="03"
                                title="Execution Constraint"
                                desc="Friction or restriction is applied automatically—no decision required."
                                side="left"
                            />
                            <MechanismStep
                                number="04"
                                title="Outcome Stabilization"
                                desc="Behavior converges toward declared intent without reliance on motivation."
                                side="right"
                            />
                        </div>
                    </div>

                    <div className="mt-32 text-center">
                        <p className="text-2xl text-iron-200 font-display uppercase tracking-widest italic mb-4">
                            "Iron-X does not ask whether you feel ready. It enforces what you already decided."
                        </p>
                        <div className="w-16 h-1 bg-iron-800 mx-auto" />
                    </div>
                </div>
            </section>

            {/* 4. OBSERVED USE PATTERNS */}
            <section className="py-40 px-6 bg-black border-y border-iron-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-xs font-mono text-iron-500 uppercase tracking-[0.4em] text-center mb-16">
                        Operational Signals from Active Deployments
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-iron-900 border border-iron-900 overflow-hidden">
                        <SignalBlock
                            id="01"
                            title="Decision Fatigue Reduction"
                            desc="Users reduce context switching by delegating enforcement to predetermined rules."
                        />
                        <SignalBlock
                            id="02"
                            title="Time Drift Compression"
                            desc="Declared work windows experience measurable variance reduction across execution cycles."
                        />
                        <SignalBlock
                            id="03"
                            title="Identity Stabilization"
                            desc="Users report fewer internal negotiation loops and reduced decision overhead."
                        />
                        <SignalBlock
                            id="04"
                            title="Intervention Acceptance"
                            desc="Initial resistance to constraints typically resolves within 7–14 operational days."
                        />
                    </div>
                </div>
            </section>

            {/* 5. INITIALIZATION MODULE */}
            <section className="py-40 px-6 bg-neutral-950 flex justify-center">
                <div className="max-w-4xl w-full">
                    <div className="mb-16">
                        <h2 className="text-4xl font-bold text-white font-display uppercase mb-4">Initialize Your Discipline Profile</h2>
                        <p className="text-neutral-500 font-mono">Align system constraints with your tolerance for enforcement.</p>
                    </div>
                    <InitializationModule />
                </div>
            </section>

            {/* 6. ENFORCEMENT ARCHITECTURE */}
            <section id="architecture" className="py-40 px-6 bg-black border-y border-iron-900">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-24">
                        <h2 className="text-4xl md:text-5xl font-bold text-white font-display uppercase mb-6">Iron-X Enforcement Stack</h2>
                        <p className="text-xl text-neutral-500 font-mono">Layered system of governance for mission-critical execution.</p>
                    </div>

                    <div className="space-y-4">
                        <ArchitectureLayer
                            id="04"
                            name="Outcome Layer"
                            desc="Measured stabilization across time cycles. Feedback loop for policy refinement."
                            icon={<Target className="w-5 h-5" />}
                        />
                        <ArchitectureLayer
                            id="03"
                            name="Enforcement Layer"
                            desc="Automated constraints applied when drift exceeds policy limits. No manual intervention."
                            icon={<Lock className="w-5 h-5" />}
                        />
                        <ArchitectureLayer
                            id="02"
                            name="Policy Layer"
                            desc="Rules that describe acceptable deviation thresholds and trigger conditions."
                            icon={<FileText className="w-5 h-5" />}
                        />
                        <ArchitectureLayer
                            id="01"
                            name="Identity Layer"
                            desc="Defines the operator, not the user. Establishes declared intent and baseline parameters."
                            icon={<Users className="w-5 h-5" />}
                        />
                    </div>

                    <div className="mt-16 p-8 border border-iron-800 bg-iron-950/30 rounded-sm">
                        <p className="text-neutral-400 font-mono text-sm">
                            <span className="text-iron-500 mr-2">// Note:</span>
                            Iron-X behaves closer to infrastructure middleware than a lifestyle application.
                        </p>
                    </div>
                </div>
            </section>

            {/* 7. GOVERNANCE PROJECTION ENGINE */}
            <section className="py-40 px-6 bg-neutral-950">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-24 text-center">
                        <h2 className="text-5xl md:text-6xl font-bold text-white font-display uppercase mb-6">Governance Projection Engine</h2>
                        <p className="text-xl text-neutral-500 font-mono">Model the impact of enforced discipline parameters on your operational baseline.</p>
                    </div>
                    <GovernanceProjectionEngine />
                </div>
            </section>

            {/* 8. SYSTEM PHILOSOPHY */}
            <section className="py-40 px-6 bg-black">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-white font-display uppercase mb-12">Motivation Scales Poorly. <br /><span className="text-iron-500">Enforcement Scales Reliably.</span></h2>

                    <div className="space-y-8 text-lg text-neutral-400 font-light leading-relaxed">
                        <p>
                            Modern productivity systems depend on emotional cycles. Energy, mood, and willpower fluctuate. Iron-X treats discipline as an architectural problem.
                        </p>
                        <p>
                            Instead of asking users to try harder, the system reduces the number of decisions required to stay aligned with declared intent.
                        </p>
                        <div className="p-8 border-l-2 border-iron-800 bg-iron-950/20 my-12">
                            <p className="text-white font-display uppercase tracking-widest text-2xl">
                                Every negotiation with yourself is a transaction cost. <span className="text-iron-500">Iron-X removes the negotiation.</span>
                            </p>
                        </div>
                        <p>
                            Iron-X is less about doing more, and more about removing the ability to drift.
                        </p>
                    </div>
                </div>
            </section>

            {/* 9. FINAL CONVERSION POINT */}
            <section className="py-40 px-6 border-t border-iron-900 bg-neutral-950">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-12 border border-iron-800 bg-black hardened-border flex flex-col items-start">
                        <h3 className="text-3xl font-bold text-white font-display uppercase mb-6">Review System Blueprint</h3>
                        <p className="text-neutral-500 font-mono mb-10 flex-grow">
                            For users who need structural understanding before commitment. Detailed technical documentation, enforcement examples, and policy templates.
                        </p>
                        <Link to="/docs" className="text-white font-display uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-4 transition-all">
                            Review Technical Architecture <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="p-12 border border-white bg-white flex flex-col items-start relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity className="w-24 h-24 text-black" />
                        </div>
                        <h3 className="text-3xl font-bold text-black font-display uppercase mb-6">Initialize Discipline Profile</h3>
                        <p className="text-neutral-600 font-mono mb-10 flex-grow">
                            For users ready to operate inside constraints. Direct initialization of your enforcement environment and baseline parameters.
                        </p>
                        <Link to="/register" className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest font-display text-lg">
                            Enter Iron-X
                        </Link>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
};

/* --- SHARED COMPONENTS --- */

const SelectionItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-center gap-3 text-neutral-300 font-mono text-sm group">
        <span className="text-iron-500 group-hover:text-iron-400 transition-colors">⬢</span>
        {text}
    </li>
);

const RejectionItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-center gap-3 text-neutral-500 font-mono text-sm group">
        <span className="text-red-900 group-hover:text-red-700 transition-colors">✕</span>
        {text}
    </li>
);

const MechanismStep: React.FC<{ number: string; title: string; desc: string; side: 'left' | 'right' }> = ({ number, title, desc, side }) => (
    <div className={`flex flex-col md:flex-row items-center gap-12 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
        <div className="flex-1 text-center md:text-right">
            {side === 'left' && (
                <>
                    <h3 className="text-2xl font-bold text-white font-display mb-2 uppercase">{title}</h3>
                    <p className="text-neutral-500 font-mono text-sm leading-relaxed">{desc}</p>
                </>
            )}
        </div>
        <div className="relative z-10 flex flex-col items-center">
            <div className={`w-14 h-14 border border-iron-800 bg-neutral-900 flex items-center justify-center font-bold font-mono text-xl ${side === 'left' ? 'text-iron-400' : 'text-neutral-500'}`}>
                {number}
            </div>
        </div>
        <div className="flex-1 text-center md:text-left">
            {side === 'right' && (
                <>
                    <h3 className="text-2xl font-bold text-white font-display mb-2 uppercase">{title}</h3>
                    <p className="text-neutral-500 font-mono text-sm leading-relaxed">{desc}</p>
                </>
            )}
        </div>
    </div>
);

const SignalBlock: React.FC<{ id: string; title: string; desc: string }> = ({ id, title, desc }) => (
    <div className="bg-black p-10 flex flex-col items-start gap-4">
        <span className="text-[10px] font-mono text-iron-700 uppercase tracking-widest leading-none">{id} // SIGNAL</span>
        <h3 className="text-lg font-bold text-white font-display uppercase tracking-wider">{title}</h3>
        <p className="text-sm text-neutral-500 font-mono leading-relaxed">{desc}</p>
    </div>
);

const ArchitectureLayer: React.FC<{ id: string; name: string; desc: string; icon: React.ReactNode }> = ({ id, name, desc, icon }) => (
    <div className="group border border-iron-900 bg-neutral-950 p-6 flex gap-8 items-center hover:border-iron-500 transition-all cursor-crosshair">
        <div className="text-xs font-mono text-iron-700">{id}</div>
        <div className="p-3 bg-iron-900/50 text-iron-400 border border-iron-800 rounded-sm">
            {icon}
        </div>
        <div className="flex-grow">
            <h4 className="text-xl font-bold text-white font-display uppercase tracking-widest mb-1">{name}</h4>
            <p className="text-sm text-neutral-500 font-mono">{desc}</p>
        </div>
    </div>
);

/* --- INTERACTIVE MODULES --- */

const InitializationModule: React.FC = () => {
    const [step, setStep] = useState(1);

    return (
        <div className="border border-iron-800 bg-black min-h-[400px] flex flex-col">
            {/* Header / Nav */}
            <div className="flex border-b border-iron-800">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`flex-1 py-4 text-center text-[10px] font-mono uppercase tracking-[0.2em] transition-colors
                            ${step === i ? 'bg-iron-900 text-white' : 'text-iron-600'}`}
                    >
                        Step {String(i).padStart(2, '0')} // {i === 1 ? 'Preference' : i === 2 ? 'Tolerance' : 'Axis'}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-grow p-12 overflow-y-auto">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <label className="text-xs font-mono text-iron-400 uppercase tracking-widest block mb-10">Enforcement Preference</label>
                        <div className="space-y-4">
                            <ConfigOption title="Soft Guardrails" desc="Notifications, logging, minimal friction" />
                            <ConfigOption title="Structured Constraint" desc="App blocking, scheduled lockouts" active />
                            <ConfigOption title="Hard Enforcement" desc="System-level restrictions, no override paths" />
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <label className="text-xs font-mono text-iron-400 uppercase tracking-widest block mb-10">Drift Tolerance</label>
                        <div className="space-y-4">
                            <ConfigOption title="Low Variance" desc="5–10% deviation acceptable" />
                            <ConfigOption title="Moderate Variance" desc="10–20% deviation acceptable" active />
                            <ConfigOption title="Strict Zero-Drift" desc="Immediate intervention on deviation" />
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <label className="text-xs font-mono text-iron-400 uppercase tracking-widest block mb-10">Primary Outcome Axis</label>
                        <div className="space-y-4">
                            <ConfigOption title="Execution Consistency" desc="Minimize behavioral variance" active />
                            <ConfigOption title="Cognitive Clarity" desc="Reduce decision loops" />
                            <ConfigOption title="Time Protection" desc="Defend declared work windows" />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Controls */}
            <div className="p-8 border-t border-iron-800 flex justify-between items-center bg-neutral-950/50">
                <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="text-iron-600 hover:text-white transition-colors disabled:opacity-0 font-mono text-xs uppercase tracking-widest"
                >
                    [ Back ]
                </button>
                <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-iron-700 uppercase">Configuration: Locked_v0.9</span>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="bg-white text-black px-6 py-2 font-bold uppercase tracking-widest font-mono text-xs"
                        >
                            Continue
                        </button>
                    ) : (
                        <Link
                            to="/register"
                            className="bg-iron-400 text-black px-6 py-2 font-bold uppercase tracking-widest font-mono text-xs shadow-lg shadow-iron-500/20"
                        >
                            Initialize Profile
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

const ConfigOption: React.FC<{ title: string; desc: string; active?: boolean }> = ({ title, desc, active }) => (
    <div className={`p-6 border transition-all cursor-pointer flex items-center justify-between group ${active ? 'border-white bg-white/5' : 'border-iron-900 bg-black hover:border-iron-700'}`}>
        <div>
            <h4 className={`text-lg font-bold font-display uppercase tracking-widest mb-1 ${active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>{title}</h4>
            <p className="text-xs font-mono text-iron-600">{desc}</p>
        </div>
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? 'border-white' : 'border-iron-800'}`}>
            {active && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
        </div>
    </div>
);

const GovernanceProjectionEngine: React.FC = () => {
    const [drift, setDrift] = useState(12);

    return (
        <div className="bg-black border border-iron-800 hardened-border p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <label className="text-xs font-mono text-iron-400 uppercase tracking-widest flex justify-between">
                            Weekly Drift Hours <span>{drift}h</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="40"
                            value={drift}
                            onChange={(e) => setDrift(parseInt(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-iron-700 uppercase">
                            <span>1h</span>
                            <span>40h</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <p className="text-xs font-mono text-iron-500 uppercase tracking-widest">Projection Assumptions</p>
                        <ul className="space-y-3 text-[10px] font-mono text-iron-700 uppercase leading-relaxed">
                            <li className="flex gap-2"><span>-</span> <span>Declared enforcement policies remain active</span></li>
                            <li className="flex gap-2"><span>-</span> <span>Results represent modeled stabilization, not guaranteed performance</span></li>
                            <li className="flex gap-2"><span>-</span> <span>Individual variance affects convergence timeline</span></li>
                            <li className="flex gap-2"><span>-</span> <span>System requires 14–21 days for behavioral normalization</span></li>
                        </ul>
                    </div>
                </div>

                <div className="bg-iron-950/50 p-10 md:p-14 border border-iron-900 rounded-sm flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
                    <div className="absolute top-0 right-0 p-4">
                        <Server className="w-12 h-12 text-iron-900" />
                    </div>
                    {/* Technical Decorative Elements */}
                    <div className="absolute top-6 right-6 flex flex-col gap-1 opacity-10">
                        <div className="w-6 h-2 border border-iron-700 rounded-full" />
                        <div className="w-6 h-2 border border-iron-700 rounded-full bg-iron-800" />
                    </div>
                    <span className="text-xs font-mono text-iron-500 uppercase tracking-[0.4em] mb-10">Output: Projected Stabilization</span>
                    <div className="text-7xl font-bold text-white font-display uppercase mb-4 tabular-nums">-{Math.round(drift * 0.85)}h</div>
                    <p className="text-xs font-mono text-iron-400 uppercase tracking-widest">Reduction in weekly variance</p>
                    <div className="mt-12 flex items-center gap-4 text-xs font-mono text-iron-700 bg-black/50 px-4 py-2 border border-iron-900">
                        <AlertCircle className="w-3 h-3 text-iron-600" />
                        Assumes 15% initial resistance factor
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
