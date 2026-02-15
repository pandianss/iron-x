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
        <div className="fixed bottom-6 right-6 bg-white border border-iron-200 shadow-xl rounded-lg p-4 w-64 animate-slide-up z-50">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-semibold text-iron-900">Execution Logged</h4>
                <button onClick={() => { setVisible(false); onClose(); }} className="text-iron-400 hover:text-iron-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-iron-600">Status</span>
                    <span className={`font-mono font-bold ${status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {status}
                    </span>
                </div>

                <div className="h-px bg-iron-100 my-2"></div>

                <div className="flex justify-between items-center text-xs">
                    <span className="text-iron-500">Proj. Score Impact</span>
                    <span className="text-indigo-600 font-medium">{scoreDelta}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-iron-500">Habit Strength</span>
                    <span className="text-indigo-600 font-medium">{habitDelta}</span>
                </div>
            </div>
        </div>
    );
};

export default ExecutionFeedbackPanel;
