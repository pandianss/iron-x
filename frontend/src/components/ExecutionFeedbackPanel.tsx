import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface FeedbackProps {
    status: 'COMPLETED' | 'LATE'; // Missed actions are handled via background checks usually, but could be here if manually marked
    onClose: () => void;
}

const ExecutionFeedbackPanel: React.FC<FeedbackProps> = ({ status, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 5000); // Auto-dismiss after 5s

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    // Derived feedback logic (simulated for UI, backend handles actual calculation)
    const scoreDelta = status === 'COMPLETED' ? '+0.7' : '+0.3'; // Rough simulation based on formula
    const habitDelta = status === 'COMPLETED' ? '+1' : '+0.5';

    return (
        <div className="fixed bottom-6 right-6 bg-iron-950 border border-iron-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-5 w-72 animate-slide-up z-50 glass-panel hardened-border">
            <div className="flex justify-between items-start mb-4 border-b border-iron-900 pb-2">
                <h4 className="text-[10px] font-bold text-iron-500 uppercase tracking-[0.3em]">Operational Logged</h4>
                <button onClick={() => { setVisible(false); onClose(); }} className="text-iron-700 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-iron-700 uppercase tracking-widest leading-none">Status</span>
                    <span className={`text-xs font-bold uppercase tracking-widest tabular-nums ${status === 'COMPLETED' ? 'text-green-500' : 'text-amber-500'}`}>
                        {status}
                    </span>
                </div>

                <div className="h-px bg-iron-900"></div>

                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-iron-700 uppercase tracking-widest leading-none">DS_Index Delta</span>
                    <span className="text-white font-bold tabular-nums text-xs">{scoreDelta}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] text-iron-700 uppercase tracking-widest leading-none">Habit Momentum</span>
                    <span className="text-white font-bold tabular-nums text-xs">{habitDelta}</span>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-1 h-full bg-green-900/50"></div>
        </div>
    );
};

export default ExecutionFeedbackPanel;
