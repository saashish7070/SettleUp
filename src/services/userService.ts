import { User } from '../types';

// Simulating database operations with localStorage
const USERS_STORAGE_KEY = 'settleup_users';

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJson) {
      // Initialize with empty array if not exists
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(usersJson);
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const users = await getUsers();
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Add new user
export const addUser = async (user: User): Promise<boolean> => {
  try {
    const users = await getUsers();
    const updatedUsers = [...users, user];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    return true;
  } catch (error) {
    console.error('Error adding user:', error);
    return false;
  }
};

// Update existing user
export const updateUser = async (updatedUser: User): Promise<boolean> => {
  try {
    const users = await getUsers();
    const updatedUsers = users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    );
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

// Search users by name or email
export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const users = await getUsers();
    const lowerQuery = query.toLowerCase();
    
    return users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) || 
      user.email.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};