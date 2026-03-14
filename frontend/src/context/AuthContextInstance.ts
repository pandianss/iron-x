import { createContext } from 'react';

export interface User {
    id: string;
    email: string;
    org_id?: string;
    organization?: {
        name: string;
        slug: string;
    };
    role?: {
        name: string;
    };
    plan_tier?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
