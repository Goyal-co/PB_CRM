import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type LoginResponse } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'user';
  initials: string;
  avatarColor: string;
  phone?: string;
  is_active: boolean;
  project_ids?: string[];
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (role: string): string => {
  switch (role) {
    case 'super_admin':
      return 'bg-blue-600';
    case 'manager':
      return 'bg-green-600';
    case 'user':
      return 'bg-purple-600';
    default:
      return 'bg-gray-600';
  }
};

const mapProfileToUser = (profile: LoginResponse['profile']): User => {
  // Extract project IDs from projects array (same as Admin page)
  // Backend returns projects as array of objects: [{id, name}, ...]
  console.log('=== mapProfileToUser DEBUG ===');
  console.log('Full profile object:', profile);
  console.log('profile.projects:', (profile as any).projects);
  console.log('profile.project_ids:', profile.project_ids);
  console.log('All profile keys:', Object.keys(profile));
  
  const projectIds = (profile as any).projects?.map((p: any) => p.id) || profile.project_ids || [];
  console.log('Extracted projectIds:', projectIds);
  console.log('=== END DEBUG ===');
  
  return {
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`,
    email: profile.email,
    role: profile.role,
    initials: getInitials(profile.first_name, profile.last_name),
    avatarColor: getAvatarColor(profile.role),
    phone: profile.phone,
    is_active: profile.is_active,
    project_ids: projectIds,
  };
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedProfile = authService.getStoredProfile();
      if (storedProfile) {
        setCurrentUser(mapProfileToUser(storedProfile));
        
        // Fetch fresh profile to get latest project assignments
        try {
          const freshProfile = await authService.getMyProfile();
          console.log('Fresh Profile on app load:', freshProfile);
          setCurrentUser(mapProfileToUser(freshProfile));
        } catch (error) {
          console.error('Failed to fetch fresh profile:', error);
          // Keep using stored profile if fetch fails
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.login({ email, password });
      
      // Fetch full profile to get project_ids
      const fullProfile = await authService.getMyProfile();
      console.log('Full Profile from API:', fullProfile);
      const user = mapProfileToUser(fullProfile);
      console.log('Mapped User:', user);
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
