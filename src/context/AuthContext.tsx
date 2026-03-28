import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'manager';
  initials: string;
  avatarColor: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const USERS: (User & { password: string })[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Admin User',
    email: 'admin@realestate.com',
    role: 'admin',
    initials: 'AR',
    avatarColor: 'bg-blue-600',
  },
  {
    id: '2',
    username: 'agent',
    password: 'agent123',
    name: 'Rahul Sharma',
    email: 'rahul@realestate.com',
    role: 'agent',
    initials: 'RS',
    avatarColor: 'bg-purple-600',
  },
  {
    id: '3',
    username: 'manager',
    password: 'manager123',
    name: 'Manager User',
    email: 'manager@realestate.com',
    role: 'manager',
    initials: 'MU',
    avatarColor: 'bg-green-600',
  },
];

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const match = USERS.find(u => u.username === username && u.password === password);
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...user } = match;
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
