import { useDiscipline } from '../hooks/useDiscipline';

export default function DisciplineIdentityCard() {
    const { identity: data, loading } = useDiscipline();

    if (loading) return <div className="animate-pulse h-32 bg-iron-900/20 border border-iron-900"></div>;
    if (!data) return null;

    return (
        <div className="bg-iron-950/40 p-6 border border-iron-900 hardened-border relative overflow-hidden glass-panel">
            {data.supervisionMode === 'LOW_SUPERVISION' && (
                <div className="absolute top-0 right-0 bg-iron-900/80 text-iron-400 text-[9px] font-bold px-3 py-1 border-l border-b border-iron-800 uppercase tracking-widest flex items-center">
                    <div className="w-1 h-1 bg-iron-500 rounded-full mr-2"></div>
                    Supervision: Low
                </div>
            )}

            <h3 className="text-xs font-bold text-iron-500 uppercase tracking-[0.3em] mb-6 border-b border-iron-900 pb-2">Operational Identity</h3>

            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-white uppercase font-display tracking-tight leading-none">
                        {data.classification.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-iron-600 uppercase tracking-widest mt-2 flex items-center">
                        <span className="w-8 h-px bg-iron-800 mr-2"></span>
                        {data.daysAtCurrent} Cycles at Current Level
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-5xl font-display font-bold text-white tabular-nums leading-none">{data.score}</div>
                    <div className="text-[10px] text-iron-500 font-mono uppercase tracking-[0.2em] mt-1">Metric: DS_INDEX</div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-iron-900 flex justify-between text-[10px] text-iron-700 uppercase tracking-widest">
                <span>Next Threshold: <strong className="text-iron-500">{data.nextThreshold}</strong></span>
                <span>Current: <strong className="text-white">{data.score}</strong></span>
            </div>
        </div>
    );
}

