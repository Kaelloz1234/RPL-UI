import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db, User } from '../services/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (userData: Omit<User, 'id' | 'role' | 'joinDate'>) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const sessionUser = localStorage.getItem('currentUser');
    if (sessionUser) {
      const userData = JSON.parse(sessionUser);
      const currentUser = db.getUserById(userData.id);
      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const register = (userData: Omit<User, 'id' | 'role' | 'joinDate'>) => {
    // Check if username already exists
    const existingUser = db.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error('Username sudah digunakan');
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      role: 'pelanggan',
      joinDate: new Date().toISOString(),
    };
    
    db.addUser(newUser);
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const login = (username: string, password: string): boolean => {
    const foundUser = db.getUserByUsername(username);
    
    if (foundUser && foundUser.password === password) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const refreshUser = () => {
    if (user) {
      const updatedUser = db.getUserById(user.id);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
