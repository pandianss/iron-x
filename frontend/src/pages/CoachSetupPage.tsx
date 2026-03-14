import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Shield, 
    ChevronRight, 
    Copy, 
    CheckCircle2,
    Loader2,
    Briefcase
} from 'lucide-react';
import { CoachClient } from '../domain/coach';

const CoachSetupPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [coachName, setCoachName] = useState('');
    const [loading, setLoading] = useState(false);
    const [setupData, setSetupData] = useState<{ invite_link: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleInitialize = async () => {
        setLoading(true);
        try {
            const data = await CoachClient.initialize(coachName);
            setSetupData(data);
            setStep(3);
        } catch (error) {
            console.error('Setup failed', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (setupData?.invite_link) {
            navigator.clipboard.writeText(setupData.invite_link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
            <div className="max-w-md w-full border border-iron-800 bg-[#0A0A0A] p-8 space-y-8 relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 text-blue-500">
                            <Briefcase size={24} />
                            <h1 className="text-xl font-display font-black tracking-tighter uppercase italic">
                                Initializing_Coach_Node
                            </h1>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="text-sm text-iron-500 leading-relaxed uppercase tracking-tight">
                                // NAME YOUR COACHING PRACTICE. THIS WILL BE VISIBLE TO CLIENTS DURING ENROLLMENT.
                            </div>
                            <input 
                                type="text"
                                value={coachName}
                                onChange={(e) => setCoachName(e.target.value)}
                                placeholder="E.G. TITAN PERFORMANCE"
                                className="w-full bg-black border border-iron-800 p-4 text-white focus:outline-none focus:border-blue-600 transition-colors uppercase"
                            />
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            disabled={!coachName}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-4 font-black uppercase tracking-tighter italic flex items-center justify-center gap-2 group transition-all"
                        >
                            Establish_Protocol
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col items-center justify-center gap-6 py-12 text-center text-blue-500">
                            <Loader2 size={48} className="animate-spin" />
                            <div className="space-y-2">
                                <h1 className="text-xl font-display font-black tracking-tighter uppercase italic">
                                    Syncing_Institutional_Data
                                </h1>
                                <p className="text-[10px] text-iron-500 uppercase tracking-widest">
                                    Creating Organization & Client Teams...
                                </p>
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-[10px] text-iron-600 font-mono space-y-1">
                                <div>{`> INITIALIZING HANDLER...`}</div>
                                <div>{`> MAPPING PERMISSIONS...`}</div>
                                <div>{`> BYPASS_LOCKOUT GRANTED`}</div>
                            </div>
                        ) : (
                            <button 
                                onClick={handleInitialize}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 font-black uppercase tracking-tighter italic"
                            >
                                Execute_Initialization
                            </button>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-3 text-green-500">
                            <Shield size={24} />
                            <h1 className="text-xl font-display font-black tracking-tighter uppercase italic">
                                Coach_Node_Active
                            </h1>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-green-500/5 border border-green-500/20 text-green-500 text-xs leading-relaxed uppercase italic">
                                // YOUR CLIENT ROSTER IS READY. SHARE THE LINK BELOW TO ENROLL NODES.
                            </div>

                            <div className="space-y-2">
                                <div className="text-[10px] text-iron-500 uppercase tracking-widest">Enrollment_Link:</div>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-black border border-iron-800 p-3 text-[10px] text-iron-300 font-mono truncate">
                                        {setupData?.invite_link}
                                    </div>
                                    <button 
                                        onClick={copyToClipboard}
                                        className="bg-iron-900 border border-iron-800 p-3 hover:bg-iron-800 text-white transition-colors"
                                    >
                                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button 
                                onClick={() => navigate('/coach')}
                                className="w-full bg-white text-black p-4 font-black uppercase tracking-tighter italic hover:bg-iron-200 transition-colors"
                            >
                                Open_Command_Center
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachSetupPage;
