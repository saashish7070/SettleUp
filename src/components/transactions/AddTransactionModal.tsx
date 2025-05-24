import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Avatar from '../ui/Avatar';
import { Transaction } from '../../types';
import { Calendar, DollarSign, MessageSquare, User } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Transaction>;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { addNewTransaction } = useTransactions();
  const { currentUser, users } = useAuth();
  
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedFriendId, setSelectedFriendId] = useState(initialData?.payeeId || '');
  const [transactionType, setTransactionType] = useState<'lend' | 'borrow'>(initialData?.category as 'lend' | 'borrow' || 'lend');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setAmount(initialData?.amount?.toString() || '');
      setDescription(initialData?.description || '');
      setSelectedFriendId(initialData?.payeeId || '');
      setTransactionType(initialData?.category as 'lend' | 'borrow' || 'lend');
      setError('');
    }
  }, [isOpen, initialData]);
  
  // Get friends list
  const friends = users.filter(user => 
    currentUser?.friends.includes(user.id) || user.id === initialData?.payeeId
  );
  
  const handleSubmit = async () => {
    // Validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    if (!selectedFriendId) {
      setError('Please select a friend');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const amountValue = parseFloat(amount);
      
      const newTransaction: Omit<Transaction, 'id' | 'relatedTransactionId'> = {
        amount: amountValue,
        description,
        date: new Date().toISOString(),
        category: transactionType,
        payerId: transactionType === 'lend' ? currentUser!.id : selectedFriendId,
        payeeId: transactionType === 'lend' ? selectedFriendId : currentUser!.id,
        settled: false,
      };
      
      const result = await addNewTransaction(newTransaction);
      if (result) {
        onClose();
      } else {
        setError('Failed to add transaction. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Transaction"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={transactionType === 'lend' ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => setTransactionType('lend')}
            >
              I lent money
            </Button>
            <Button
              variant={transactionType === 'borrow' ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => setTransactionType('borrow')}
            >
              I borrowed money
            </Button>
          </div>
        </div>
        
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          leftIcon={<DollarSign size={18} />}
          min="0.01"
          step="0.01"
          required
        />
        
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner, movie tickets, etc."
          leftIcon={<MessageSquare size={18} />}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Friend
          </label>
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className={`p-3 rounded-lg flex items-center cursor-pointer transition-colors ${
                    selectedFriendId === friend.id 
                      ? 'bg-primary-50 border-2 border-primary-500' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                  onClick={() => setSelectedFriendId(friend.id)}
                >
                  <Avatar name={friend.name} size="sm" />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {friend.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">
                You don't have any friends yet
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => {
                  onClose();
                  // Navigate to friends page using a setTimeout to avoid issues with modal closing
                  setTimeout(() => window.location.href = '/friends', 100);
                }}
              >
                Add Friends
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddTransactionModal;