import { Preferences } from '@capacitor/preferences';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    uid: string;
    email: string;
    role: 'owner' | 'customer';
    shopId?: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, role: 'owner' | 'customer') => Promise<boolean>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadSession = async () => {
            const { value } = await Preferences.get({ key: 'user_session' });
            if (value) {
                setUser(JSON.parse(value));
            }
            setLoading(false);
        };
        loadSession();
    }, []);

    const login = async (email: string, role: 'owner' | 'customer') => {
        setLoading(true);
        try {
            // ... (keep existing demo logic)
            let newUser: User | null = null;

            if (role === 'owner') {
                let shopId = undefined;
                const match = email.match(/^owner(\d+)@example\.com$/);
                if (match) {
                    shopId = `shop${match[1]}`;
                } else {
                    // Fallback or default
                    shopId = 'shop1';
                }
                newUser = { uid: email, email, role, shopId };
            } else {
                newUser = { uid: 'customer_' + Math.random().toString(36).substr(2, 9), email, role };
            }

            setUser(newUser);
            await Preferences.set({ key: 'user_session', value: JSON.stringify(newUser) });
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
        await Preferences.remove({ key: 'user_session' });
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
