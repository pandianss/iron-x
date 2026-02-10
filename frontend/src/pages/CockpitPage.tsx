import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { DisciplineStatusBar } from '../components/cockpit/DisciplineStatusBar';
import { PressureDriftPanel } from '../components/cockpit/PressureDriftPanel';
import { ActiveControlsPanel } from '../components/cockpit/ActiveControlsPanel';
import { ViolationHorizon } from '../components/cockpit/ViolationHorizon';
import { AuditLogPanel } from '../components/cockpit/AuditLogPanel';

const API_BASE = 'http://localhost:3000';

const CockpitPage: React.FC = () => {
    const { token } = useAuth();
    const [state, setState] = useState<any>(null);
    const [pressure, setPressure] = useState<any>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [constraints, setConstraints] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!token) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [s, p, pr, c, h] = await Promise.all([
                axios.get(`${API_BASE}/discipline/state`, { headers }),
                axios.get(`${API_BASE}/discipline/pressure`, { headers }),
                axios.get(`${API_BASE}/discipline/predictions`, { headers }),
                axios.get(`${API_BASE}/discipline/constraints`, { headers }),
                axios.get(`${API_BASE}/discipline/history`, { headers }),
            ]);

            setState(s.data);
            setPressure(p.data);
            setPredictions(pr.data);
            setConstraints(c.data);
            setHistory(h.data);
        } catch (error) {
            console.error('Failed to fetch cockpit data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [token]);

    if (loading || !state) {
        return (
            <div className="h-screen w-screen bg-neutral-base flex items-center justify-center mono-display text-sm opacity-50">
                INITIALIZING ENFORCEMENT INTERFACE...
            </div>
        );
    }

    const isBreach = state.status === 'BREACH';

    return (
        <div className={`h-screen w-screen flex flex-col bg-neutral-base overflow-hidden p-4 gap-4 transition-breach ${isBreach ? 'grayscale brightness-75' : ''}`}>
            {/* 1. Discipline Status Bar (persistent) */}
            <DisciplineStatusBar
                score={state.score}
                status={state.status}
                lastViolation={state.timeSinceLastViolation}
                nextCheck={state.countdownToNextCheck}
            />

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Left Side: Pressure & Drift (Primary focus) */}
                <div className="flex-1 flex flex-col gap-4">
                    <PressureDriftPanel
                        compositePressure={pressure.compositePressure}
                        driftVectors={pressure.driftVectors}
                    />

                    {/* 3. Active Controls & Constraints */}
                    <ActiveControlsPanel
                        policies={constraints.activePolicies}
                        exceptions={constraints.exceptions}
                        reducedPrivileges={constraints.reducedPrivileges}
                        frozenActions={constraints.frozenActions}
                    />
                </div>

                {/* Right Side: Violation Horizon (Forward-looking) */}
                <ViolationHorizon predictions={predictions} />
            </div>

            {/* 5. Audit & Consequence Log (compressed) */}
            <AuditLogPanel logs={history} />

            {isBreach && (
                <div className="fixed inset-0 pointer-events-none border-[12px] border-red-600/20 z-50 animate-pulse">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 text-9xl font-black opacity-10 rotate-12 select-none">
                        BREACH
                    </div>
                </div>
            )}
        </div>
    );
};

export default CockpitPage;
