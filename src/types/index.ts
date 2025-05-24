export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  friends: string[]; // Array of user IDs
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: 'lend' | 'borrow' | 'split';
  payerId: string; // User who paid
  payeeId: string; // User who received/owes
  settled: boolean;
  relatedTransactionId?: string; // ID of the other side of the transaction
  splitDetails?: SplitDetail[];
}

export interface SplitDetail {
  userId: string;
  amount: number;
  paid: boolean;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Balance {
  userId: string;
  name: string;
  amount: number; // Positive = they owe you, Negative = you owe them
}