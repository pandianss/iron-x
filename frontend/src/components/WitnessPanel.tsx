import { useState, useEffect } from 'react';
import { WitnessClient } from '../domain/witness';
import { BillingClient } from '../domain/billing';
import { User, X, Loader2, Shield, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WitnessPanelProps {
    actionId: string;
    currentWitnessId?: string | null;
    witnessEmail?: string | null;
    witnessTier?: string | null;
}

export default function WitnessPanel({ actionId, currentWitnessId, witnessEmail, witnessTier }: WitnessPanelProps) {
    const [subscription, setSubscription] = useState<any>(null);
    const [eligibleWitnesses, setEligibleWitnesses] = useState<any[]>([]);
    const [showAssignDropdown, setShowAssignDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [assignedWitness, setAssignedWitness] = useState<string | null>(currentWitnessId || null);
    const [assignedEmail, setAssignedEmail] = useState<string | null>(witnessEmail || null);
    const [assignedTier, setAssignedTier] = useState<string | null>(witnessTier || null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sub = await BillingClient.getSubscription();
                setSubscription(sub);
            } catch (err) {
                console.error('Failed to load subscription data', err);
            }
        };
        fetchData();
    }, []);

    const handleAssignClick = async () => {
        setLoading(true);
        try {
            const witnesses = await WitnessClient.getEligibleWitnesses();
            setEligibleWitnesses(witnesses);
            setShowAssignDropdown(true);
        } catch (err) {
            console.error('Failed to load eligible witnesses', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (witnessId: string, email: string, tier: string) => {
        setLoading(true);
        try {
            await WitnessClient.assignWitness(actionId, witnessId);
            setAssignedWitness(witnessId);
            setAssignedEmail(email);
            setAssignedTier(tier);
            setShowAssignDropdown(false);
        } catch (err) {
            console.error('Failed to assign witness', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        setLoading(true);
        try {
            await WitnessClient.removeWitness(actionId);
            setAssignedWitness(null);
            setAssignedEmail(null);
            setAssignedTier(null);
        } catch (err) {
            console.error('Failed to remove witness', err);
        } finally {
            setLoading(false);
        }
    };

    if (subscription?.plan_tier === 'FREE') {
        return (
            <div className="mt-4 pt-4 border-t border-iron-100 flex items-center gap-2 text-[10px] font-mono text-iron-500 uppercase tracking-widest">
                <Shield size={12} className="opacity-50" />
                <span>Witness Network — OPERATOR feature</span>
                <Link to="/pricing" className="text-blue-600 hover:text-blue-800 underline ml-auto">Upgrade</Link>
            </div>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-iron-100 relative">
            {!assignedWitness ? (
                <div className="space-y-4">
                    {!showAssignDropdown ? (
                        <button
                            onClick={handleAssignClick}
                            disabled={loading}
                            className="flex items-center gap-2 text-[10px] font-mono text-iron-600 hover:text-iron-900 uppercase tracking-widest transition-colors"
                        >
                            {loading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                            Assign Witness
                        </button>
                    ) : (
                        <div className="bg-iron-50 p-3 border border-iron-200 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-mono text-iron-500 uppercase tracking-widest">Eligible Witnesses</span>
                                <button onClick={() => setShowAssignDropdown(false)} className="text-iron-400 hover:text-iron-600">
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                {eligibleWitnesses.length === 0 ? (
                                    <p className="text-[10px] font-mono text-iron-400 italic py-2">No team members available.</p>
                                ) : (
                                    eligibleWitnesses.map(w => (
                                        <button
                                            key={w.user_id}
                                            onClick={() => handleAssign(w.user_id, w.email, w.trust_tier)}
                                            className="w-full text-left p-2 hover:bg-white border border-transparent hover:border-iron-200 transition-all flex items-center justify-between group"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="text-xs font-mono text-iron-900">{w.email}</div>
                                                <div className="text-[9px] font-mono text-iron-500 uppercase tracking-tighter">
                                                    Tier: {w.trust_tier} • DS: {w.current_discipline_score}
                                                </div>
                                            </div>
                                            <div className="text-[9px] font-mono text-blue-600 opacity-0 group-hover:opacity-100 uppercase font-bold">Assign</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 text-blue-600 border border-blue-100">
                            <User size={14} />
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[10px] font-mono text-iron-400 uppercase tracking-[0.2em]">EYE_ON_NODE</div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-iron-900">{assignedEmail}</span>
                                <span className="text-[9px] font-mono px-1.5 bg-iron-100 text-iron-600 border border-iron-200">
                                    {assignedTier}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        disabled={loading}
                        className="opacity-0 group-hover:opacity-100 text-[9px] font-mono text-red-500 hover:text-red-700 uppercase tracking-widest transition-all px-2 py-1 hover:bg-red-50"
                    >
                        {loading ? <Loader2 size={10} className="animate-spin" /> : 'Terminate_Watch'}
                    </button>
                </div>
            )}
        </div>
    );
}
