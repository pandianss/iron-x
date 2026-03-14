
import React, { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OnboardingChecklist() {
    const [steps] = useState([
        { id: 1, title: 'Initialize Governance', description: 'Configure your first goal and action sequence.', completed: true, link: '/goals' },
        { id: 2, title: 'Establish Witness', description: 'Assign an operator to validate your adherence.', completed: false, link: '/witness' },
        { id: 3, title: 'Enable Hard Lockouts', description: 'Protect your focus windows with system enforcement.', completed: false, link: '/security' },
        { id: 4, title: 'Growth Protocol', description: 'Refer 1 operator to unlock advanced analytics.', completed: false, link: '#' },
    ]);

    const completedCount = steps.filter(s => s.completed).length;

    return (
        <div className="bg-iron-950/40 border border-iron-900 p-8 hardened-border glass-panel font-mono mb-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-xs font-bold text-iron-500 uppercase tracking-[0.3em] mb-2">Operator Activation</h2>
                    <div className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">
                        Node Completion: {Math.round((completedCount / steps.length) * 100)}%
                    </div>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-[10px] text-iron-700 uppercase tracking-widest mb-1">Status</div>
                    <div className="text-xs text-yellow-500 uppercase font-black tracking-widest">[ PROVISIONAL NODE ]</div>
                </div>
            </div>

            <div className="space-y-4">
                {steps.map((step) => (
                    <Link 
                        key={step.id} 
                        to={step.link}
                        className={`group flex items-center justify-between p-4 border transition-all ${
                            step.completed 
                            ? 'border-green-900/30 bg-green-950/5 opacity-60' 
                            : 'border-iron-900 bg-iron-950/20 hover:border-iron-700'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            {step.completed ? (
                                <CheckCircle2 size={20} className="text-green-500" />
                            ) : (
                                <Circle size={20} className="text-iron-700 group-hover:text-white" />
                            )}
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-tight ${step.completed ? 'text-iron-500 line-through' : 'text-white'}`}>
                                    {step.title}
                                </h4>
                                <p className="text-[9px] text-iron-600 uppercase mt-0.5">{step.description}</p>
                            </div>
                        </div>
                        {!step.completed && <ArrowRight size={14} className="text-iron-800 group-hover:text-white group-hover:translate-x-1 transition-all" />}
                    </Link>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-iron-900/50 flex items-center justify-between text-[10px]">
                <div className="text-iron-700 uppercase tracking-widest">
                    // Completion of activation sequence grants 500 Legacy pts.
                </div>
            </div>
        </div>
    );
}
