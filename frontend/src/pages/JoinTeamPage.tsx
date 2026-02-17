
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { TeamClient } from '../domain/team';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function JoinTeamPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated) return; // Wait for auth check or redirect by ProtectedRoute (but this page might be public-ish)
        // Actually, this page should probably be protected. If not logged in, user should login first.
        // We will handle that in the component logical flow.

        const joinTeam = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid invitation link.');
                return;
            }

            try {
                const res = await TeamClient.acceptInvitation(token);
                setStatus('success');
                setMessage(res.message);
                setTimeout(() => navigate('/dashboard'), 3000);
            } catch (err: unknown) {
                console.error(err);
                setStatus('error');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setMessage((err as any).response?.data?.error || 'Failed to join team. The link may be expired or invalid.');
            }
        };

        joinTeam();
    }, [token, isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-iron-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-iron-900">Authentication Required</h2>
                    <p className="mt-2 text-sm text-iron-600">
                        Please log in or register to join the team.
                    </p>
                    <div className="mt-6 space-y-3">
                        <Link to={`/login?redirect=/join/${token}`} className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            Log In
                        </Link>
                        <Link to={`/register?redirect=/join/${token}`} className="block w-full py-2 px-4 border border-iron-300 rounded-md shadow-sm text-sm font-medium text-iron-700 bg-white hover:bg-iron-50">
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-iron-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    {status === 'pending' && (
                        <div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <h2 className="mt-4 text-xl font-medium text-iron-900">Joining Team...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div>
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                            <h2 className="mt-4 text-2xl font-bold text-iron-900">Success!</h2>
                            <p className="mt-2 text-iron-600">{message}</p>
                            <p className="mt-4 text-sm text-iron-500">Redirecting to dashboard...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                            <h2 className="mt-4 text-xl font-bold text-iron-900">Error</h2>
                            <p className="mt-2 text-red-600">{message}</p>
                            <Link to="/dashboard" className="mt-6 inline-flex items-center text-indigo-600 hover:text-indigo-500">
                                Go to Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

