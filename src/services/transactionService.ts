import { Transaction } from '../types';

// Simulating database operations with localStorage
const TRANSACTIONS_STORAGE_KEY = 'settleup_transactions';

// Get all transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const transactionsJson = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!transactionsJson) {
      // Initialize with empty array if not exists
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(transactionsJson);
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

// Add new transaction
export const addTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    const transactions = await getTransactions();
    const updatedTransactions = [...transactions, transaction];
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTransactions));
    return true;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return false;
  }
};

// Update existing transaction
export const updateTransaction = async (updatedTransaction: Transaction): Promise<boolean> => {
  try {
    const transactions = await getTransactions();
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    );
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTransactions));
    return true;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return false;
  }
};

// Delete transaction
export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    const transactions = await getTransactions();
    const updatedTransactions = transactions.filter(
      transaction => transaction.id !== transactionId
    );
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTransactions));
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

// Get transaction by ID
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
  try {
    const transactions = await getTransactions();
    return transactions.find(transaction => transaction.id === id) || null;
  } catch (error) {
    console.error('Error getting transaction by ID:', error);
    return null;
  }
};