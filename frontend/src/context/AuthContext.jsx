import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI } from '../api/authAPI';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await loginAPI({ email, password });
        const token = res.data.token;
        const userData = { userId: res.data.userId, email: res.data.email, role: res.data.role, name: res.data.name };
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return res;
    };

    const register = async (formData) => {
        return await registerAPI(formData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
