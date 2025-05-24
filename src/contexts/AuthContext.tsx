import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, addUser, updateUser } from '../services/userService';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string) => Promise<boolean>;
  addFriend: (friendId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Load all users
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
        
        // Check for stored user session
        const storedUserId = localStorage.getItem('currentUserId');
        if (storedUserId) {
          const user = loadedUsers.find(u => u.id === storedUserId);
          if (user) {
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  const register = async (name: string, email: string): Promise<boolean> => {
    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    const newUser: User = {
      id: uuidv4(),
      name,
      email,
      friends: [],
    };

    try {
      await addUser(newUser);
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('currentUserId', newUser.id);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  };

  const addFriend = async (friendId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    // Check if already friends
    if (currentUser.friends.includes(friendId)) return true;
    
    try {
      const updatedUser = {
        ...currentUser,
        friends: [...currentUser.friends, friendId]
      };
      
      await updateUser(updatedUser);
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      return true;
    } catch (error) {
      console.error('Error adding friend:', error);
      return false;
    }
  };

  const removeFriend = async (friendId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const updatedUser = {
        ...currentUser,
        friends: currentUser.friends.filter(id => id !== friendId)
      };
      
      await updateUser(updatedUser);
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    users,
    loading,
    login,
    logout,
    register,
    addFriend,
    removeFriend
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};