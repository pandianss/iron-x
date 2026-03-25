import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Activity, 
    Target, 
    History, 
    Shield, 
    Users, 
    FileText, 
    LogOut,
    ExternalLink,
    Code,
    X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
    { name: 'Cockpit', path: '/cockpit', icon: Activity },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Actions', path: '/actions', icon: History },
    { name: 'Witness', path: '/witness', icon: Users },
    { name: 'Compliance', path: '/compliance', icon: FileText },
    { name: 'Security', path: '/security', icon: Shield },
    { name: 'Developer', path: '/developer', icon: Code },
];

export function NavigationSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
    const { logout } = useAuth();

    return (
        <aside className="w-64 bg-black border-r border-iron-900 flex flex-col h-screen sticky top-0 font-mono">
            {/* Logo Area */}
            <div className="p-8 border-b border-iron-900/50 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white flex items-center justify-center">
                            <span className="text-black font-black text-xl leading-none">I</span>
                        </div>
                        <span className="text-white font-black tracking-[0.2em] text-sm uppercase">Iron-X</span>
                    </div>
                    <div className="mt-4 text-[9px] text-iron-600 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        System_Operational
                    </div>
                </div>
                {/* Mobile Close Button */}
                <button 
                    onClick={onMobileClose}
                    className="lg:hidden p-2 text-iron-600 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="text-iron-700 text-[9px] font-bold uppercase tracking-[0.3em] mb-4 ml-2">Primary_Navigation</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onMobileClose}
                        className={({ isActive }) => 
                            `flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                isActive 
                                    ? 'bg-white text-black border-white' 
                                    : 'text-iron-500 border-transparent hover:text-iron-300 hover:border-iron-900 hover:bg-white/5'
                            }`
                        }
                    >
                        <item.icon size={16} className="shrink-0" />
                        {item.name}
                    </NavLink>
                ))}

                <div className="pt-8 text-iron-700 text-[9px] font-bold uppercase tracking-[0.3em] mb-4 ml-2">External_Links</div>
                <a 
                    href="/docs" 
                    target="_blank" 
                    className="flex items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-iron-600 hover:text-iron-300 transition-colors"
                >
                    <ExternalLink size={16} />
                    Documentation
                </a>
            </nav>

            {/* Footer / User Info */}
            <div className="p-6 border-t border-iron-900/50">
                <button
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-950/20 border border-red-900/50 text-red-500 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all"
                >
                    <LogOut size={14} />
                    Deauthorize
                </button>
                <div className="mt-6 flex justify-between items-center text-[8px] text-iron-800 font-mono tracking-tighter uppercase">
                    <span>V1.0.0_STABLE</span>
                    <span>IRONX_SYS_NODE</span>
                </div>
            </div>
        </aside>
    );
}
