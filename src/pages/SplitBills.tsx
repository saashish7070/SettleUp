import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import { Plus, Minus, Calculator, DollarSign, Trash2, CreditCard, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { SplitDetail, Transaction } from '../types';

const SplitBills: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { addNewTransaction } = useTransactions();
  
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Get friends
  const friends = users.filter(user => 
    currentUser?.friends.includes(user.id)
  );
  
  // Calculate per person amount for equal split
  const calculateEqualSplit = () => {
    const total = parseFloat(totalAmount) || 0;
    const numPeople = selectedFriends.length + 1; // +1 for current user
    return numPeople > 0 ? total / numPeople : 0;
  };
  
  // Toggle friend selection
  const toggleFriendSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
      
      // Remove custom amount
      const newCustomAmounts = { ...customAmounts };
      delete newCustomAmounts[friendId];
      setCustomAmounts(newCustomAmounts);
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
      
      // Initialize custom amount to equal split
      if (splitType === 'custom') {
        const equalAmount = calculateEqualSplit().toFixed(2);
        setCustomAmounts({
          ...customAmounts,
          [friendId]: equalAmount
        });
      }
    }
  };
  
  // Update custom amount for a friend
  const updateCustomAmount = (friendId: string, amount: string) => {
    setCustomAmounts({
      ...customAmounts,
      [friendId]: amount
    });
  };
  
  // Calculate remaining amount (for custom split)
  const calculateRemainingAmount = () => {
    const total = parseFloat(totalAmount) || 0;
    const totalAssigned = Object.values(customAmounts)
      .reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
    
    return total - totalAssigned;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!totalAmount || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      setError('Please enter a valid total amount');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    if (selectedFriends.length === 0) {
      setError('Please select at least one friend to split with');
      return;
    }
    
    if (splitType === 'custom') {
      // Validate custom amounts
      for (const friendId of selectedFriends) {
        const amount = customAmounts[friendId];
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
          setError(`Please enter a valid amount for all selected friends`);
          return;
        }
      }
      
      // Check if total matches
      const totalCustom = Object.values(customAmounts)
        .reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
      
      const total = parseFloat(totalAmount);
      
      if (Math.abs(totalCustom - total) > 0.01) { // Allow small rounding differences
        setError(`The sum of individual amounts (${totalCustom.toFixed(2)}) doesn't match the total (${total.toFixed(2)})`);
        return;
      }
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create split details
      const splitDetails: SplitDetail[] = selectedFriends.map(friendId => {
        let amount = 0;
        
        if (splitType === 'equal') {
          amount = calculateEqualSplit();
        } else {
          amount = parseFloat(customAmounts[friendId]) || 0;
        }
        
        return {
          userId: friendId,
          amount,
          paid: false
        };
      });
      
      // Create transaction for each friend
      for (const detail of splitDetails) {
        const newTransaction: Omit<Transaction, 'id' | 'relatedTransactionId'> = {
          amount: detail.amount,
          description,
          date: new Date().toISOString(),
          category: 'split',
          payerId: currentUser!.id,
          payeeId: detail.userId,
          settled: false,
          splitDetails: [detail]
        };
        
        await addNewTransaction(newTransaction);
      }
      
      // Reset form and show success
      setSuccess(true);
      setTotalAmount('');
      setDescription('');
      setSelectedFriends([]);
      setCustomAmounts({});
      setSplitType('equal');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Split Bills</h1>
        <p className="text-gray-600">Easily split expenses with friends</p>
      </header>
      
      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center animate-fade-in">
          <div className="mr-3 flex-shrink-0">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p>Bill split successfully! Transactions have been created.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Split Details</h2>
            
            {error && (
              <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dinner, Movie night, etc."
                required
              />
              
              <Input
                label="Total Amount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                leftIcon={<DollarSign size={18} />}
                min="0.01"
                step="0.01"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Split Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={splitType === 'equal' ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={() => setSplitType('equal')}
                    icon={<Calculator size={18} />}
                  >
                    Split Equally
                  </Button>
                  <Button
                    variant={splitType === 'custom' ? 'primary' : 'secondary'}
                    fullWidth
                    onClick={() => setSplitType('custom')}
                    icon={<Users size={18} />}
                  >
                    Custom Split
                  </Button>
                </div>
              </div>
              
              {selectedFriends.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Friends</h3>
                  
                  <div className="space-y-3">
                    {splitType === 'equal' ? (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Each person pays:</span>
                          <span className="font-medium">${calculateEqualSplit().toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Your portion:</span>
                            <span className="font-medium">
                              ${calculateRemainingAmount().toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        {selectedFriends.map(friendId => {
                          const friend = users.find(u => u.id === friendId);
                          if (!friend) return null;
                          
                          return (
                            <div key={friendId} className="flex items-center">
                              <Avatar name={friend.name} size="sm" />
                              <span className="ml-2 text-sm flex-1">{friend.name}</span>
                              <div className="w-24">
                                <Input
                                  type="number"
                                  value={customAmounts[friendId] || ''}
                                  onChange={(e) => updateCustomAmount(friendId, e.target.value)}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                  className="text-right"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  icon={<CreditCard size={18} />}
                  className="py-2.5"
                >
                  {isSubmitting ? 'Splitting Bill...' : 'Split Bill'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Friends</h2>
            
            {friends.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    className={`p-3 rounded-lg flex items-center cursor-pointer transition-colors ${
                      selectedFriends.includes(friend.id) 
                        ? 'bg-primary-50 border border-primary-200' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                    }`}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <div className="flex-shrink-0">
                      <Avatar name={friend.name} size="sm" />
                    </div>
                    <span className="ml-2 text-sm font-medium flex-1">
                      {friend.name}
                    </span>
                    {selectedFriends.includes(friend.id) ? (
                      <Minus size={18} className="text-red-500" />
                    ) : (
                      <Plus size={18} className="text-primary-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-gray-500 text-sm mb-3">
                  You don't have any friends yet
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.location.href = '/friends'}
                >
                  Add Friends
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SplitBills;