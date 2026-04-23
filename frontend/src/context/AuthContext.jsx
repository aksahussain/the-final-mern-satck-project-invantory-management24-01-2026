import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode";
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async (storedUser) => {
            try {
                // Attach token briefly for the profile call
                const config = {
                    headers: { Authorization: `Bearer ${storedUser.token}` }
                };
                const { data } = await API.get('/auth/profile', config);
                const updatedUser = { ...storedUser, ...data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } catch (error) {
                console.error("Failed to sync user profile", error);
                // If profile fails (e.g. token expired), clear session
                localStorage.removeItem('user');
                setUser(null);
            }
        };

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.token) {
            try {
                const decoded = jwtDecode(storedUser.token);
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('user');
                    setUser(null);
                } else {
                    // Start with stored info, then sync with server
                    setUser(storedUser);
                    fetchUser(storedUser);
                }
            } catch (error) {
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
