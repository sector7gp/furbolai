'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    userId: number;
    username: string;
    role: 'Jugador' | 'Entrenador' | 'Admin';
    displayName: string;
    playerId: number | null;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                    // Redirect to login if not already there or in other public pages
                    const publicPages = ['/login', '/public']; 
                    if (!publicPages.includes(window.location.pathname)) {
                        console.log('[UserContext] No active session, redirecting to login');
                        router.push('/login');
                    }
                }
            } catch (err) {
                console.error('[UserContext] Error fetching user:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/login');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
