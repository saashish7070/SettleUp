import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { Plus, Search, Mail, User, UserPlus, X } from 'lucide-react';

const Friends: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [error, setError] = useState('');
  const { currentUser, users, addFriend } = useAuth();
  const { getBalances } = useTransactions();
  const navigate = useNavigate();
  
  // Get friends with balances
  const friendsWithBalances = currentUser?.friends.map(friendId => {
    const friend = users.find(user => user.id === friendId);
    if (!friend) return null;
    
    const balance = getBalances().find(b => b.userId === friendId);
    
    return {
      ...friend,
      balance: balance?.amount || 0
    };
  }).filter(Boolean) as (typeof users[0] & { balance: number })[];
  
  // Filter friends by search query
  const filteredFriends = friendsWithBalances.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle adding a new friend
  const handleAddFriend = async () => {
    if (!newFriendEmail.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    // Check if user exists
    const friendUser = users.find(user => 
      user.email.toLowerCase() === newFriendEmail.toLowerCase() && 
      user.id !== currentUser?.id
    );
    
    if (!friendUser) {
      setError('No user found with that email address');
      return;
    }
    
    // Check if already friends
    if (currentUser?.friends.includes(friendUser.id)) {
      setError('You are already friends with this user');
      return;
    }
    
    try {
      const success = await addFriend(friendUser.id);
      if (success) {
        setIsAddFriendModalOpen(false);
        setNewFriendEmail('');
        setError('');
      } else {
        setError('Failed to add friend. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <p className="text-gray-600">Manage your connections</p>
        </div>
        <Button 
          variant="primary"
          icon={<UserPlus size={18} />}
          onClick={() => setIsAddFriendModalOpen(true)}
        >
          Add Friend
        </Button>
      </header>
      
      {/* Search */}
      <div>
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </div>
      
      {/* Friends List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFriends.length > 0 ? (
          filteredFriends.map(friend => (
            <Card 
              key={friend.id} 
              className="p-5 hover:shadow-md transition-shadow"
              hoverable
              onClick={() => navigate(`/friends/${friend.id}`)}
            >
              <div className="flex items-start">
                <Avatar name={friend.name} size="lg" />
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-900">{friend.name}</h3>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                  
                  {friend.balance !== 0 && (
                    <div className="mt-2">
                      {friend.balance > 0 ? (
                        <div className="text-green-600 font-medium text-sm">
                          Owes you ${friend.balance.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-red-600 font-medium text-sm">
                          You owe ${Math.abs(friend.balance).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              {searchQuery ? (
                <p className="text-gray-500">No friends found matching "{searchQuery}"</p>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <User size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                  <p className="text-gray-500 mb-4">
                    Add friends to start tracking expenses together
                  </p>
                  <Button 
                    variant="primary"
                    onClick={() => setIsAddFriendModalOpen(true)}
                  >
                    Add Your First Friend
                  </Button>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
      
      {/* Add Friend Modal */}
      <Modal
        isOpen={isAddFriendModalOpen}
        onClose={() => {
          setIsAddFriendModalOpen(false);
          setNewFriendEmail('');
          setError('');
        }}
        title="Add Friend"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsAddFriendModalOpen(false);
                setNewFriendEmail('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddFriend}
            >
              Add Friend
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
          
          <p className="text-gray-600 text-sm">
            Enter the email address of the person you want to add as a friend.
          </p>
          
          <Input
            label="Friend's Email"
            type="email"
            value={newFriendEmail}
            onChange={(e) => setNewFriendEmail(e.target.value)}
            placeholder="friend@example.com"
            leftIcon={<Mail size={18} />}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Friends;