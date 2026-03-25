import { useEffect, useState } from 'react';
import { useDiscipline } from '../../hooks/useDiscipline';
import { AuthClient } from '../../domain/auth';
import { UserPlus } from 'lucide-react';
import InviteMemberModal from '../InviteMemberModal';

interface UserProfile {
    user_id: string;
    team_memberships: Array<{
        role: string;
        team: {
            team_id: string;
            name: string;
            owner_id: string;
        }
    }>;
    teams_owned: Array<{
        team_id: string;
        name: string;
    }>;
}

export function DisciplineStatusBar() {
    const { state } = useDiscipline();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profileData = await AuthClient.getProfile();
                setProfile(profileData);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };
        fetchProfile();
    }, []);


    if (!state) return (
        <div className="w-full bg-iron-950/50 backdrop-blur-md border-b border-iron-900 px-6 py-4 flex items-center justify-center animate-pulse h-[81px]">
            <div className="flex gap-4 items-center">
                <div className="w-2 h-2 bg-iron-800 rounded-full animate-bounce"></div>
                <span className="text-iron-700 font-mono text-[10px] uppercase tracking-[0.4em]">Initializing Core_Systems...</span>
            </div>
        </div>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'HIGH_RELIABILITY': return 'text-green-400';
            case 'STABLE': return 'text-iron-200';
            case 'RECOVERING': return 'text-amber-500';
            case 'ONBOARDING': return 'text-blue-400';
            default: return 'text-iron-500';
        }
    };

    // Determine if user can invite (Manager or Owner of any team)
    // For simplicity, we pick the first team they manage/own to invite to.
    // Ideally, if multiple, we'd have a dropdown or the modal would ask which team.
    // MVP: Pick first team found.
    const managedTeam = profile?.team_memberships.find(m => m.role === 'MANAGER' || m.team.owner_id === profile.user_id)?.team
        || profile?.teams_owned[0];

    return (
        <div className="w-full bg-black/40 backdrop-blur-xl border-b border-iron-900/50 px-4 lg:px-8 py-3 lg:py-5 font-mono text-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 relative z-50">
            {/* Scanned scanline effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 hidden lg:block">
                <div className="w-full h-full bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-scan"></div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-iron-800/30 to-transparent"></div>

            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-12 items-center">
                <div className="flex flex-col border-l border-iron-900 pl-3 lg:pl-4">
                    <span className="text-iron-600 text-[8px] lg:text-[9px] uppercase tracking-[0.3em] mb-1">DS_Index</span>
                    <span className="text-2xl lg:text-3xl font-bold text-white font-display tabular-nums leading-none">{state.score}</span>
                </div>

                <div className="flex flex-col border-l border-iron-900 pl-3 lg:pl-4">
                    <span className="text-iron-600 text-[8px] lg:text-[9px] uppercase tracking-[0.3em] mb-1">Operational Tier</span>
                    <span className={`text-sm lg:text-xl font-bold uppercase font-display tracking-tight leading-none ${getStatusColor(state.classification)}`}>
                        {{
                            'ONBOARDING': 'ONBOARDING',
                            'RECOVERING': 'RECOVERING',
                            'STABLE': 'STABLE',
                            'HIGH_RELIABILITY': 'HIGH_REL',
                        }[state.classification] ?? state.classification}
                    </span>
                </div>

                <div className="flex flex-col border-l border-iron-900 pl-3 lg:pl-4">
                    <span className="text-iron-600 text-[8px] lg:text-[9px] uppercase tracking-[0.3em] mb-1">Constraints</span>
                    <span className="text-lg lg:text-xl font-bold text-iron-300 font-display tabular-nums leading-none">
                        {state.activeConstraints?.policiesActive ?? 0}
                    </span>
                </div>

                <div className="flex flex-col border-l border-iron-900 pl-3 lg:pl-4">
                    <span className="text-iron-600 text-[8px] lg:text-[9px] uppercase tracking-[0.3em] mb-1">Horizon</span>
                    <span className={`text-lg lg:text-xl font-bold font-display uppercase tracking-tight leading-none ${state.violationHorizon?.daysUntilBreach ? 'text-amber-500' : 'text-iron-500'}`}>
                        {state.violationHorizon?.daysUntilBreach ? `${state.violationHorizon.daysUntilBreach}D` : 'STABLE'}
                    </span>
                </div>
            </div>

            {managedTeam && (
                <div className="lg:ml-8 lg:pl-8 lg:border-l-2 border-iron-900">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-iron-200 transition-all text-[10px] uppercase font-bold tracking-[0.2em] border border-white"
                    >
                        <UserPlus size={14} className="stroke-[3]" />
                        Initialize Node
                    </button>
                    <InviteMemberModal
                        isOpen={isInviteModalOpen}
                        onClose={() => setIsInviteModalOpen(false)}
                        teamId={managedTeam.team_id || (managedTeam as any).id}
                    />
                </div>
            )}
        </div>
    );
};
