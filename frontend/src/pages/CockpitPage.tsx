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
        const interval = setInterval(fetchData, 10000); // Poll every 10s for high awareness
        return () => clearInterval(interval);
    }, [token]);

    if (loading || !state) {
        return (
            <div className="h-screen w-screen bg-neutral-base flex items-center justify-center mono-display text-sm opacity-50 crt-flicker">
                INITIALIZING ENFORCEMENT INTERFACE...
            </div>
        );
    }

    const isBreach = state.status === 'BREACH';

    return (
        <div className={`h-screen w-screen flex flex-col bg-neutral-base overflow-hidden p-4 gap-4 transition-breach relative ${isBreach ? 'grayscale brightness-75' : ''}`}>
            {/* Visual Enforcement Layers */}
            <div className="scanline-overlay" />
            {isBreach && <div className="fixed inset-0 z-[10000] breach-disruption pointer-events-none opacity-40 animate-pulse" />}

            {/* 1. Discipline Status Bar (persistent) */}
            <div className="z-10">
                <DisciplineStatusBar
                    score={state.score}
                    status={state.status}
                    lastViolation={state.timeSinceLastViolation}
                    nextCheck={state.countdownToNextCheck}
                />
            </div>

            <div className="flex-1 flex gap-4 min-h-0 z-10">
                {/* Left Side: Pressure & Drift (Primary focus) */}
                <div className={`flex-1 flex flex-col gap-4 ${isBreach ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
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
                <div className={`flex-[0.6] min-h-0 flex flex-col ${isBreach ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                    <ViolationHorizon predictions={predictions} />
                </div>
            </div>

            {/* 5. Audit & Consequence Log (compressed) */}
            <div className="z-10">
                <AuditLogPanel logs={history} />
            </div>

            {isBreach && (
                <div className="fixed inset-0 pointer-events-none border-[24px] border-red-900/10 z-[10001] flex items-center justify-center">
                    <div className="text-red-600 text-[15vw] font-black opacity-10 -rotate-12 select-none tracking-tighter">
                        BREACH
                    </div>
                </div>
            )}
        </div>
    );
};

export default CockpitPage;
