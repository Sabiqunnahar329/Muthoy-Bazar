import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

// Roles that may open /admin. Match these to the role values your backend returns.
export const STAFF_ROLES = ['super_admin', 'admin', 'inventory_manager', 'delivery_operator'];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb_user')); } catch { return null; }
  });

  // One login for admins, staff and customers. Backend: POST /auth/login -> { token, user: { name, role } }
  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('mb_token', data.token);
    localStorage.setItem('mb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  // Used after registration: { token, user }
  const setSession = ({ token, user: u }) => {
    localStorage.setItem('mb_token', token);
    localStorage.setItem('mb_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('mb_token');
    localStorage.removeItem('mb_user');
    setUser(null);
  };

  const isStaff = !!user && STAFF_ROLES.includes(user.role);
  return <AuthContext.Provider value={{ user, login, setSession, logout, isStaff }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
