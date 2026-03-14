import { Lock, ShieldAlert, Twitter, Download, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LockoutPage() {
    return (
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-6 selection:bg-red-600 selection:text-white">
            <div className="max-w-xl w-full space-y-12">
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse" />
                        <div className="relative border-2 border-red-600 p-8 rounded-full">
                            <Lock size={64} className="text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-6">
                    <h1 className="text-5xl font-display font-black uppercase tracking-tighter leading-none">
                        Protocol <span className="text-red-600">Breach</span> Detected
                    </h1>
                    <p className="text-sm text-iron-700 uppercase tracking-[0.3em]">
                        System Node 74x-ALPHA // Active Lockout Phase
                    </p>
                </div>

                <div className="bg-iron-950/20 border border-red-900 p-8 hardened-border space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldAlert size={100} />
                    </div>

                    <div className="space-y-4">
                        <div className="text-[10px] text-red-700 uppercase tracking-widest border-b border-red-900 pb-2">Reason for Enforcement</div>
                        <p className="text-lg font-bold uppercase">"Drift Threshold Exceeded: 3 Consecutive Missed Focus Windows"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-red-900 bg-red-950/10">
                            <div className="text-[8px] text-red-800 uppercase tracking-widest mb-1">Duration</div>
                            <div className="text-2xl font-display font-black">04:00:00</div>
                        </div>
                        <div className="p-4 border border-red-900 bg-red-950/10">
                            <div className="text-[8px] text-red-800 uppercase tracking-widest mb-1">Penalty</div>
                            <div className="text-2xl font-display font-black">-150 pts</div>
                        </div>
                    </div>

                    <p className="text-[9px] text-iron-600 leading-relaxed uppercase">
                        This operator has defined high-consequence rules. The Iron-X Protocol is now enforcing them. 
                        No negotiations. No overrides. 
                    </p>
                </div>

                <div className="space-y-6 text-center">
                    <div className="text-[10px] text-iron-700 uppercase tracking-[0.4em] mb-4">Initialize Your Own Enforcement Protocol</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link 
                            to="/register" 
                            className="flex-grow bg-white text-black px-8 py-4 font-display font-black uppercase text-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-3 group"
                        >
                            Get Iron-X FREE
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="px-8 py-4 border border-iron-800 text-iron-500 hover:text-white hover:border-white transition-all text-xs flex items-center justify-center gap-3">
                            <Twitter size={18} />
                            Share Protocol Failure
                        </button>
                    </div>
                    
                    <div className="flex justify-center gap-8 opacity-30">
                        <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest">
                            <Download size={12} />
                            Save Asset
                        </div>
                        <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest">
                            <ExternalLink size={12} />
                            View Audit Log
                        </div>
                    </div>
                </div>

                <p className="text-center text-[8px] text-iron-800 uppercase tracking-[0.5em] pt-12">
                    // DISCIPLINE IS THE ONLY INFRASTRUCTURE THAT MATTERS.
                </p>
            </div>
        </div>
    );
}
