import { useState, useEffect } from 'react';
import { generateDriftReport, type DriftAnalysis } from '../domain/analytics';
import { BillingClient } from '../domain/billing';
import { 
    Activity, 
    Download, 
    Loader2, 
    RefreshCcw, 
    FileText, 
    ShieldAlert, 
    Cpu, 
    Target, 
    TrendingUp,
    CheckCircle2
} from 'lucide-react';

export default function DriftReportPage() {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'GATED'>('IDLE');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [analysis, setAnalysis] = useState<DriftAnalysis | null>(null);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);
    const [isCached, setIsCached] = useState(false);

    const loadingSteps = [
        "// INITIALIZING AI HEURISTICS ENGINE...",
        "// FETCHING 7-DAY BEHAVIORAL DATASET...",
        "// ANALYZING CROSS-PROTOCOL DRIFT VECTORS...",
        "// CALCULATING RECOVERY TRAJECTORY...",
        "// GENERATING HIGH-FIDELITY DIAGNOSTIC REPORT...",
        "// FINALIZING ENCRYPTION LAYER..."
    ];

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const sub = await BillingClient.getSubscription();
                if (sub.plan_tier === 'FREE') setStatus('GATED');
            } catch (err) {
                console.error(err);
            }
        };
        checkAccess();
    }, []);

    const handleGenerate = async () => {
        setStatus('LOADING');
        let step = 0;
        const interval = setInterval(() => {
            setLoadingMessage(loadingSteps[step % loadingSteps.length]);
            step++;
        }, 1200);

        try {
            const data = await generateDriftReport();
            // Artificial delay for effect
            setTimeout(() => {
                clearInterval(interval);
                setAnalysis(data.analysis);
                setPdfBase64(data.pdfBase64);
                setGeneratedAt(data.generated_at);
                setIsCached(data.cached);
                setStatus('SUCCESS');
            }, 3000);
        } catch (err: any) {
            clearInterval(interval);
            console.error(err);
            setStatus('IDLE');
            alert(err.response?.data?.message || 'Failed to generate report.');
        }
    };

    const handleDownload = () => {
        if (!pdfBase64) return;
        const binary = atob(pdfBase64);
        const bytes = new Uint8Array(binary.length).map((_, i) => binary.charCodeAt(i));
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iron-x-drift-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (status === 'LOADING') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
                <div className="relative">
                    <Loader2 className="w-24 h-24 text-blue-600 animate-spin opacity-20" />
                    <Cpu className="w-12 h-12 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-3 text-center">
                    <div className="text-[12px] font-mono text-blue-500 uppercase tracking-[0.3em] font-black">
                        AI_DIAGNOSTIC_IN_PROGRESS
                    </div>
                    <div className="text-[14px] font-mono text-white/80 lowercase tracking-widest min-h-[1.5rem]">
                        {loadingMessage}
                        <span className="inline-block w-2 h-4 bg-blue-500 ml-2 animate-bounce"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'GATED') {
        return (
            <div className="max-w-2xl mx-auto py-32 px-8 text-center space-y-8">
                <div className="flex justify-center">
                    <div className="p-6 bg-red-950/20 border border-red-900 rounded-full">
                        <ShieldAlert size={64} className="text-red-500" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter">
                        DRIFT ANALYSIS // LOCKED
                    </h1>
                    <p className="text-iron-500 font-mono text-sm leading-relaxed max-w-md mx-auto">
                        This diagnostic engine requires high-level system permissions. 
                        Drift Analysis is exclusive to the <span className="text-white font-bold">OPERATOR</span> license.
                    </p>
                </div>
                <div className="pt-8">
                    <a href="/billing" className="inline-block bg-white text-black font-display font-black uppercase tracking-widest px-12 py-4 hover:bg-iron-200 transition-all shadow-[8px_8px_0_rgba(255,255,255,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
                        INITIALIZE OPERATOR NODE →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-12">
            {/* Header */}
            <div className="border-b border-iron-900 pb-8 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-iron-500 uppercase tracking-widest">
                    <Activity size={12} />
                    Cognitive Integrity Layer
                </div>
                <h1 className="text-5xl font-display font-black text-white uppercase tracking-tighter">
                    DRIFT ANALYSIS <span className="text-iron-700">ENGINE</span>
                </h1>
            </div>

            {status === 'IDLE' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-xl font-display font-bold text-white uppercase italic">Diagnose behavioral decay before it becomes baseline.</h2>
                            <p className="text-iron-500 font-mono text-sm leading-relaxed">
                                Our AI heuristics engine analyzes your last 7 days of behavioral data to identify primary drift patterns, calculate root causes, and project your recovery trajectory.
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {[
                                "Identify primary behavioral drift vectors",
                                "AI-driven root cause analysis",
                                "Recommended operational adjustments",
                                "High-fidelity branded PDF export"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4 text-[10px] font-mono text-iron-400 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-blue-600"></div>
                                    {text}
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4">
                            <button
                                onClick={handleGenerate}
                                className="w-full md:w-auto bg-blue-600 text-white font-display font-black uppercase tracking-[0.2em] px-12 py-4 hover:bg-blue-500 transition-all flex items-center justify-center gap-3 group"
                            >
                                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                                GENERATE DRIFT ANALYSIS // ₹499
                            </button>
                            <p className="text-[9px] font-mono text-iron-600 mt-4 uppercase tracking-widest">
                                * Included in monthly OPERATOR subscription. One analysis per 24 hours.
                            </p>
                        </div>
                    </div>

                    <div className="bg-iron-950/40 border border-iron-900 p-8 space-y-8 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Activity size={120} />
                        </div>
                        <div className="text-[10px] font-mono text-iron-600 uppercase tracking-widest border-b border-iron-900 pb-4">
                            Sample_Diagnostic_Output
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="h-2 bg-iron-900 w-1/3"></div>
                                <div className="h-4 bg-iron-800 w-2/3"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 bg-iron-900 w-1/4"></div>
                                <div className="h-24 bg-iron-900/50 w-full"></div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-8 bg-iron-900 w-8"></div>
                                <div className="h-8 bg-iron-900 w-24"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between border border-blue-900/30 bg-blue-950/10 p-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-600 text-white">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="space-y-0.5">
                                <div className="text-[10px] font-mono text-blue-500 uppercase tracking-widest font-black">
                                    ANALYSIS_COMPLETE_{isCached ? 'CACHED' : 'LIVE'}
                                </div>
                                <div className="text-[10px] font-mono text-iron-500 uppercase tracking-widest">
                                    TIMESTAMP: {new Date(generatedAt!).toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 bg-white text-black px-6 py-2 text-[10px] font-mono font-black uppercase tracking-widest hover:bg-iron-200 transition-colors"
                        >
                            <Download size={14} />
                            Download_PDF
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Summary Card */}
                        <div className="bg-black/60 border border-iron-900 p-8 space-y-8">
                            <div className="space-y-2">
                                <div className="text-[11px] font-mono text-iron-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                    <Target size={14} className="text-blue-500" />
                                    Primary_Drift_Pattern
                                </div>
                                <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter italic">
                                    {analysis?.primary_drift_pattern}
                                </h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-mono text-iron-500 uppercase tracking-widest">Root_Cause_Mapping:</div>
                                    <p className="text-sm font-mono text-iron-300 leading-relaxed italic">
                                        "{analysis?.root_cause_suggestion}"
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-mono text-iron-500 uppercase tracking-widest">Protocol_Adjustment:</div>
                                    <p className="text-sm font-mono text-white leading-relaxed border-l-2 border-blue-600 pl-4 bg-blue-950/10 py-2">
                                        {analysis?.recommended_adjustment}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recovery Card */}
                        <div className="bg-black/40 border border-iron-900 p-8 flex flex-col justify-between space-y-12">
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <div className="text-[11px] font-mono text-iron-500 uppercase tracking-widest font-bold flex items-center gap-2">
                                        <TrendingUp size={14} className="text-green-500" />
                                        Recovery_Trajectory
                                    </div>
                                    <div className="text-[11px] font-mono text-blue-500 uppercase tracking-widest font-bold">
                                        Confidence: {analysis?.confidence_level}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-5xl font-display font-black text-white">
                                            {analysis?.projected_score_recovery}<span className="text-iron-700 text-2xl">/10</span>
                                        </div>
                                        <div className="text-[10px] font-mono text-iron-500 uppercase tracking-widest pb-2">Score_Projection</div>
                                    </div>
                                    <div className="h-2 bg-iron-900 border border-iron-800 w-full">
                                        <div 
                                            className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                                            style={{ width: `${(analysis?.projected_score_recovery || 0) * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-iron-900 flex items-center gap-4">
                                <div className="p-3 bg-iron-900 text-iron-500">
                                    <FileText size={24} />
                                </div>
                                <div className="text-[10px] font-mono text-iron-500 uppercase tracking-widest leading-relaxed">
                                    // High-fidelity PDF report ready.<br />
                                    // Contains detailed 30-day performance mapping.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-8">
                        <button
                            onClick={() => setStatus('IDLE')}
                            className="text-[10px] font-mono text-iron-500 hover:text-white uppercase tracking-[0.3em] transition-colors"
                        >
                            // GENERATE_NEW_DIAGNOSTIC_IN_24H
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
