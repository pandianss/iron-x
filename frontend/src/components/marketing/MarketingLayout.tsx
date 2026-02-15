
import React from 'react';
import { Link } from 'react-router-dom';


const MarketingNavbar: React.FC = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-iron-900 border-dashed">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="text-2xl font-bold text-white tracking-widest font-display uppercase">
                            Iron<span className="text-iron-500">-X</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/pricing" className="text-neutral-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">Licensing</Link>
                            <Link to="/roi-calculator" className="text-neutral-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">Projection Engine</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 border border-iron-900 bg-black/50">
                            <span className="w-1.5 h-1.5 bg-iron-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-mono text-iron-700 uppercase tracking-widest">Status: Operational</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/login" className="text-neutral-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">Login</Link>
                            <Link
                                to="/register"
                                className="bg-white text-black hover:bg-neutral-200 px-6 py-2.5 font-bold font-display text-xs uppercase tracking-widest transition-all"
                            >
                                Initialize Node
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const MarketingFooter: React.FC = () => {
    return (
        <footer className="bg-black border-t border-iron-900 text-neutral-600 py-20 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
                <div className="space-y-6">
                    <h3 className="text-white font-bold font-display uppercase tracking-widest">Iron-X Hub</h3>
                    <p className="text-xs font-mono leading-relaxed">
                        Governance infrastructure for execution systems. Discipline is not a feeling; it is an engineering requirement.
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold font-display uppercase tracking-widest text-xs mb-6">Environment</h4>
                    <ul className="space-y-3 text-[10px] font-mono uppercase tracking-widest">
                        <li><Link to="/pricing" className="hover:text-white transition-colors">Licensing</Link></li>
                        <li><Link to="/roi-calculator" className="hover:text-white transition-colors">Projection Engine</Link></li>
                        <li><Link to="/docs" className="hover:text-white transition-colors">Architecture</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold font-display uppercase tracking-widest text-xs mb-6">Clusters</h4>
                    <ul className="space-y-3 text-[10px] font-mono uppercase tracking-widest">
                        <li><span className="opacity-50">Enterprise (L-9)</span></li>
                        <li><span className="opacity-50">SME (L-4)</span></li>
                        <li><span className="opacity-50">Individual (L-1)</span></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold font-display uppercase tracking-widest text-xs mb-6">Support</h4>
                    <ul className="space-y-3 text-[10px] font-mono uppercase tracking-widest">
                        <li><Link to="/contact" className="hover:text-white transition-colors">Open Ticket</Link></li>
                        <li><Link to="/status" className="hover:text-white transition-colors">System State</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-iron-900/30 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-iron-800">
                <div>&copy; {new Date().getFullYear()} Iron-X Systems // Auth_V3</div>
                <div className="flex gap-8">
                    <span>Privacy_Protocol</span>
                    <span>TOS_Enforcement</span>
                </div>
            </div>
        </footer>
    );
};

const MarketingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-iron-500 selection:text-white font-mono">
            <MarketingNavbar />
            <main className="pt-24 md:pt-32">
                {children}
            </main>
            <MarketingFooter />
        </div>
    );
};

export default MarketingLayout;
