import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavigationSidebar } from '../common/NavigationSidebar';
import { Menu, X } from 'lucide-react';

export function AppLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-black overflow-hidden selection:bg-white selection:text-black">
            {/* Sidebar component - Hidden on mobile unless toggled */}
            <div className={`
                fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:flex
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="relative flex">
                    <NavigationSidebar onMobileClose={() => setIsMobileMenuOpen(false)} />
                    {/* Backdrop for mobile */}
                    <div 
                        className={`fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden -z-10 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-iron-900 bg-black/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white flex items-center justify-center">
                            <span className="text-black font-black text-xl leading-none">I</span>
                        </div>
                        <span className="text-white font-black tracking-[0.2em] text-sm uppercase">Iron-X</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-iron-400 hover:text-white transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                <div className="min-h-full">
                    <Outlet />
                </div>
                
                {/* Global Ambient Glow */}
                <div className="fixed top-0 right-0 w-[50vw] h-[50vh] bg-blue-500/5 blur-[120px] pointer-events-none -z-10"></div>
                <div className="fixed bottom-0 left-0 w-[40vw] h-[40vh] bg-amber-500/5 blur-[120px] pointer-events-none -z-10"></div>
            </main>
        </div>
    );
}
