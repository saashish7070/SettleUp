import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Balance } from '../types';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addNewTransaction: (transaction: Omit<Transaction, 'id' | 'relatedTransactionId'>) => Promise<Transaction | null>;
  updateExistingTransaction: (transaction: Transaction) => Promise<boolean>;
  removeTransaction: (transactionId: string) => Promise<boolean>;
  settleTransaction: (transactionId: string) => Promise<boolean>;
  getBalances: () => Balance[];
  getUserTransactions: (userId?: string) => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, users } = useAuth();

  useEffect(() => {
    const loadTransactions = async () => {
      if (currentUser) {
        try {
          const data = await getTransactions();
          // Filter transactions relevant to current user
          const userTransactions = data.filter(
            t => t.payerId === currentUser.id || t.payeeId === currentUser.id
          );
          setTransactions(userTransactions);
        } catch (error) {
          console.error('Error loading transactions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTransactions();
  }, [currentUser]);

  const addNewTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'relatedTransactionId'>
  ): Promise<Transaction | null> => {
    if (!currentUser) return null;

    const newTransactionId = uuidv4();
    const relatedTransactionId = uuidv4();

    try {
      // Create the main transaction
      const mainTransaction: Transaction = {
        ...transactionData,
        id: newTransactionId,
        relatedTransactionId: relatedTransactionId
      };

      // Create the related transaction (other person's perspective)
      const relatedTransaction: Transaction = {
        ...transactionData,
        id: relatedTransactionId,
        payerId: transactionData.payeeId,
        payeeId: transactionData.payerId,
        category: transactionData.category === 'lend' ? 'borrow' : transactionData.category === 'borrow' ? 'lend' : 'split',
        relatedTransactionId: newTransactionId
      };

      // Save both transactions
      await addTransaction(mainTransaction);
      await addTransaction(relatedTransaction);

      setTransactions(prev => [...prev, mainTransaction]);
      
      return mainTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  };

  const updateExistingTransaction = async (transaction: Transaction): Promise<boolean> => {
    try {
      await updateTransaction(transaction);
      
      // Also update the related transaction if it exists
      if (transaction.relatedTransactionId) {
        const relatedTransaction = transactions.find(t => t.id === transaction.relatedTransactionId);
        if (relatedTransaction) {
          const updatedRelatedTransaction: Transaction = {
            ...relatedTransaction,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
            settled: transaction.settled,
            splitDetails: transaction.splitDetails
          };
          await updateTransaction(updatedRelatedTransaction);
        }
      }

      setTransactions(prev => 
        prev.map(t => (t.id === transaction.id || t.id === transaction.relatedTransactionId) 
          ? (t.id === transaction.id ? transaction : { 
              ...t, 
              amount: transaction.amount, 
              description: transaction.description, 
              date: transaction.date,
              settled: transaction.settled,
              splitDetails: transaction.splitDetails
            }) 
          : t
        )
      );

      return true;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
  };

  const removeTransaction = async (transactionId: string): Promise<boolean> => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return false;

      await deleteTransaction(transactionId);
      
      // Also delete the related transaction
      if (transaction.relatedTransactionId) {
        await deleteTransaction(transaction.relatedTransactionId);
      }

      setTransactions(prev => 
        prev.filter(t => t.id !== transactionId && t.id !== transaction.relatedTransactionId)
      );

      return true;
    } catch (error) {
      console.error('Error removing transaction:', error);
      return false;
    }
  };

  const settleTransaction = async (transactionId: string): Promise<boolean> => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return false;

      const updatedTransaction = { ...transaction, settled: true };
      
      return await updateExistingTransaction(updatedTransaction);
    } catch (error) {
      console.error('Error settling transaction:', error);
      return false;
    }
  };

  const getBalances = (): Balance[] => {
    if (!currentUser) return [];

    const balances = new Map<string, number>();
    
    // Initialize balances with 0 for all friends
    currentUser.friends.forEach(friendId => {
      balances.set(friendId, 0);
    });

    // Calculate balances from transactions
    transactions.forEach(transaction => {
      if (transaction.settled) return;
      
      if (transaction.payerId === currentUser.id) {
        // Current user paid/lent money
        const currentBalance = balances.get(transaction.payeeId) || 0;
        balances.set(transaction.payeeId, currentBalance + transaction.amount);
      } else if (transaction.payeeId === currentUser.id) {
        // Current user received/borrowed money
        const currentBalance = balances.get(transaction.payerId) || 0;
        balances.set(transaction.payerId, currentBalance - transaction.amount);
      }
    });

    // Convert to array of Balance objects
    return Array.from(balances.entries())
      .filter(([_, amount]) => amount !== 0)
      .map(([userId, amount]) => {
        const user = users.find(u => u.id === userId);
        return {
          userId,
          name: user?.name || 'Unknown User',
          amount
        };
      });
  };

  const getUserTransactions = (userId?: string): Transaction[] => {
    if (!currentUser) return [];
    
    return transactions.filter(t => {
      if (userId) {
        // Transactions between current user and specified user
        return (
          (t.payerId === currentUser.id && t.payeeId === userId) ||
          (t.payerId === userId && t.payeeId === currentUser.id)
        );
      } else {
        // All transactions for current user
        return t.payerId === currentUser.id || t.payeeId === currentUser.id;
      }
    });
  };

  const value = {
    transactions,
    loading,
    addNewTransaction,
    updateExistingTransaction,
    removeTransaction,
    settleTransaction,
    getBalances,
    getUserTransactions
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};