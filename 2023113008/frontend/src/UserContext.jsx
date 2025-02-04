import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const { data } = await axios.get('/profile');
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setReady(true);
            }
        }

        fetchUser();
    }, []);

    async function logout() {
        try {
            await axios.post('/logout');
            setUser(null);
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    return (
        <UserContext.Provider value={{ user, setUser, ready, logout }}>
            {children}
        </UserContext.Provider>
    );
}