
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TeamClient } from '../../domain/team';
import { AuthClient } from '../../domain/auth';

interface VelocityPoint {
    userId: string;
    email: string;
    score: number;
}

interface TeamMember {
    role: string;
    team: {
        id: string;
        team_id?: string;
        owner_id: string;
    };
}

export const TeamVelocityChart: React.FC = () => {
    const [data, setData] = useState<VelocityPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {

                // inside component
                const profile = await AuthClient.getProfile();
                // Find a team managed by user
                const managedTeam = (profile.team_memberships as TeamMember[]).find((m) => m.role === 'MANAGER' || m.team.owner_id === profile.user_id)?.team
                    || profile.teams_owned[0];

                if (managedTeam) {
                    const teamId = managedTeam.team_id || managedTeam.id;
                    const result = await TeamClient.getVelocity(teamId);
                    // Mask emails for privacy in demo
                    const formattedData = result.map((r: { email: string; score: number; userId: string }) => ({
                        ...r,
                        name: r.email.split('@')[0]
                    }));
                    setData(formattedData);
                }
            } catch (error) {
                console.error('Failed to load velocity data', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="h-full flex items-center justify-center text-iron-500 text-xs">Loading Team Data...</div>;
    if (data.length === 0) return <div className="h-full flex items-center justify-center text-iron-500 text-xs">No team data or not a manager</div>;

    return (
        <div className="h-full w-full p-2">
            <h3 className="text-iron-400 text-xs uppercase mb-2 font-bold tracking-wider">Team Velocity (Discipline Score)</h3>
            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} stroke="#666" fontSize={10} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} tickLine={false} width={80} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff' }}
                            cursor={{ fill: '#27272a' }}
                        />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#10b981' : entry.score > 50 ? '#fbbf24' : '#ef4444'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
