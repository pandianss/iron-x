
import React from 'react';
import { Link } from 'react-router-dom';


const MarketingNavbar: React.FC = () => {


    return (
        <nav className="fixed top-0 w-full z-50 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-white tracking-tighter">
                            IRON-X
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <Link to="/solutions" className="text-neutral-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Solutions</Link>
                                <Link to="/pricing" className="text-neutral-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Pricing</Link>
                                <Link to="/roi-calculator" className="text-neutral-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">ROI Tool</Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex space-x-4">
                            <Link to="/login" className="text-neutral-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                            <Link
                                to="/register"
                                className="bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Get Started
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
        <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-white font-bold mb-4">IRON-X</h3>
                    <p className="text-sm">Discipline as Infrastructure.</p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3">Product</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/features" className="hover:text-white">Features</Link></li>
                        <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                        <li><Link to="/roi-calculator" className="hover:text-white">ROI Calculator</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3">Solutions</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/solutions/healthcare" className="hover:text-white">Healthcare</Link></li>
                        <li><Link to="/solutions/finance" className="hover:text-white">Finance</Link></li>
                        <li><Link to="/solutions/manufacturing" className="hover:text-white">Manufacturing</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3">Company</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/about" className="hover:text-white">About</Link></li>
                        <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-neutral-900 text-xs text-center">
                &copy; {new Date().getFullYear()} Iron-X Systems. All rights reserved.
            </div>
        </footer>
    );
};

const MarketingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-iron-500 selection:text-white font-sans">
            <MarketingNavbar />
            <main className="pt-16">
                {children}
            </main>
            <MarketingFooter />
        </div>
    );
};

export default MarketingLayout;
