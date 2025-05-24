import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { 
  ArrowLeft, 
  Plus, 
  UserX, 
  DollarSign,
  Calendar
} from 'lucide-react';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import { format } from 'date-fns';

const FriendDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, currentUser, removeFriend } = useAuth();
  const { getUserTransactions, getBalances } = useTransactions();
  
  const [friend, setFriend] = useState<typeof users[0] | null>(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isRemoveFriendModalOpen, setIsRemoveFriendModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundFriend = users.find(u => u.id === id);
      if (foundFriend) {
        setFriend(foundFriend);
      } else {
        // Friend not found, navigate back
        navigate('/friends');
      }
    }
  }, [id, users, navigate]);
  
  if (!friend || !currentUser) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Get transactions with this friend
  const friendTransactions = getUserTransactions(friend.id);
  
  // Calculate balance with this friend
  const balance = getBalances().find(b => b.userId === friend.id)?.amount || 0;
  
  const handleRemoveFriend = async () => {
    setIsRemoving(true);
    
    try {
      const success = await removeFriend(friend.id);
      if (success) {
        navigate('/friends');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    } finally {
      setIsRemoving(false);
      setIsRemoveFriendModalOpen(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back to Friends</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar name={friend.name} size="xl" />
              <h1 className="mt-4 text-xl font-bold text-gray-900">{friend.name}</h1>
              <p className="text-gray-500">{friend.email}</p>
              
              <div className="mt-6 w-full">
                <Button 
                  variant="primary"
                  icon={<Plus size={18} />}
                  fullWidth
                  className="mb-3"
                  onClick={() => setIsAddTransactionModalOpen(true)}
                >
                  Add Transaction
                </Button>
                <Button 
                  variant="error"
                  icon={<UserX size={18} />}
                  fullWidth
                  onClick={() => setIsRemoveFriendModalOpen(true)}
                >
                  Remove Friend
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Balance Summary</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  {balance > 0 
                    ? `${friend.name} owes you`
                    : balance < 0
                      ? `You owe ${friend.name}`
                      : 'All settled up!'}
                </p>
                <p className={`text-xl font-bold ${
                  balance > 0 
                    ? 'text-green-600' 
                    : balance < 0
                      ? 'text-red-600'
                      : 'text-gray-700'
                }`}>
                  {balance !== 0 ? `$${Math.abs(balance).toFixed(2)}` : '-'}
                </p>
              </div>
              
              {balance !== 0 && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setIsAddTransactionModalOpen(true)}
                >
                  {balance > 0 ? 'Remind' : 'Settle Up'}
                </Button>
              )}
            </div>
          </Card>
          
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Transaction History</h2>
            </div>
            
            {friendTransactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {friendTransactions.map(transaction => {
                  const isOutgoing = transaction.payerId === currentUser.id;
                  const formattedDate = format(new Date(transaction.date), 'MMM d, yyyy');
                  
                  return (
                    <div 
                      key={transaction.id} 
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-gray-100">
                            <DollarSign size={20} className="text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center mt-1">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="ml-1 text-xs text-gray-500">
                                {formattedDate}
                              </span>
                              {transaction.settled && (
                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                                  Settled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
                            {isOutgoing ? '-' : '+'}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {isOutgoing ? 'You paid' : 'You received'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No transactions with {friend.name} yet</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setIsAddTransactionModalOpen(true)}
                >
                  Add your first transaction
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        initialData={{ payeeId: friend.id }}
      />
      
      {/* Remove Friend Modal */}
      <Modal
        isOpen={isRemoveFriendModalOpen}
        onClose={() => setIsRemoveFriendModalOpen(false)}
        title="Remove Friend"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setIsRemoveFriendModalOpen(false)}
              disabled={isRemoving}
            >
              Cancel
            </Button>
            <Button 
              variant="error" 
              onClick={handleRemoveFriend}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removing...' : 'Remove Friend'}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to remove {friend.name} from your friends list? 
          This won't delete your transaction history, but you won't be able to 
          add new transactions with them until you add them again.
        </p>
        {balance !== 0 && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg">
            <p>
              <strong>Note:</strong> There is still {balance > 0 ? 'an outstanding balance' : 'a debt'} of ${Math.abs(balance).toFixed(2)} 
              {balance > 0 ? ` that ${friend.name} owes you` : ` that you owe ${friend.name}`}.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FriendDetail;