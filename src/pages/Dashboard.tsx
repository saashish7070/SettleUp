import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { Plus, ArrowUp, ArrowDown, UserPlus, DollarSign, Calendar, TrendingUp as Trending, CreditCard } from 'lucide-react';
import AddTransactionModal from '../components/transactions/AddTransactionModal';

const Dashboard: React.FC = () => {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { transactions, getBalances } = useTransactions();
  const navigate = useNavigate();
  
  // Calculate balances
  const balances = getBalances();
  
  // Calculate total owed to you and total you owe
  const totalOwedToYou = balances
    .filter(b => b.amount > 0)
    .reduce((total, balance) => total + balance.amount, 0);
    
  const totalYouOwe = balances
    .filter(b => b.amount < 0)
    .reduce((total, balance) => total + Math.abs(balance.amount), 0);
  
  // Get recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Quick actions
  const quickActions = [
    { 
      name: 'Add Friend', 
      icon: <UserPlus size={20} />, 
      color: 'bg-green-100 text-green-700',
      onClick: () => navigate('/friends')
    },
    { 
      name: 'New Transaction', 
      icon: <DollarSign size={20} />, 
      color: 'bg-blue-100 text-blue-700',
      onClick: () => setIsAddTransactionModalOpen(true)
    },
    { 
      name: 'Split Bill', 
      icon: <CreditCard size={20} />, 
      color: 'bg-purple-100 text-purple-700',
      onClick: () => navigate('/split-bills')
    },
    { 
      name: 'View All', 
      icon: <Trending size={20} />, 
      color: 'bg-orange-100 text-orange-700',
      onClick: () => navigate('/transactions')
    },
  ];
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
        </div>
        <Button 
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setIsAddTransactionModalOpen(true)}
        >
          Add Transaction
        </Button>
      </header>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ArrowDown size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">You are owed</h3>
              <p className="text-2xl font-bold text-gray-900">${totalOwedToYou.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4">
            {balances.filter(b => b.amount > 0).length > 0 ? (
              <div className="space-y-2">
                {balances
                  .filter(b => b.amount > 0)
                  .slice(0, 3)
                  .map((balance) => (
                    <div key={balance.userId} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar name={balance.name} size="sm" />
                        <span className="ml-2 text-sm text-gray-600">{balance.name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        +${balance.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                {balances.filter(b => b.amount > 0).length > 3 && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    fullWidth 
                    className="mt-2"
                    onClick={() => navigate('/transactions')}
                  >
                    View all
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No one owes you money right now</p>
            )}
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <ArrowUp size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">You owe</h3>
              <p className="text-2xl font-bold text-gray-900">${totalYouOwe.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4">
            {balances.filter(b => b.amount < 0).length > 0 ? (
              <div className="space-y-2">
                {balances
                  .filter(b => b.amount < 0)
                  .slice(0, 3)
                  .map((balance) => (
                    <div key={balance.userId} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar name={balance.name} size="sm" />
                        <span className="ml-2 text-sm text-gray-600">{balance.name}</span>
                      </div>
                      <span className="text-sm font-medium text-red-600">
                        -${Math.abs(balance.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                {balances.filter(b => b.amount < 0).length > 3 && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    fullWidth 
                    className="mt-2"
                    onClick={() => navigate('/transactions')}
                  >
                    View all
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">You don't owe anyone money right now</p>
            )}
          </div>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card 
              key={action.name} 
              className="p-4 text-center hover:bg-gray-50 cursor-pointer transition-all"
              onClick={action.onClick}
            >
              <div className={`${action.color} p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto`}>
                {action.icon}
              </div>
              <h3 className="mt-3 text-sm font-medium text-gray-700">{action.name}</h3>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            View all
          </Button>
        </div>
        
        <Card className="overflow-hidden">
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => {
                const isOutgoing = transaction.payerId === currentUser?.id;
                const otherPersonId = isOutgoing ? transaction.payeeId : transaction.payerId;
                
                return (
                  <div 
                    key={transaction.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/transactions/${transaction.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar 
                          name={transaction.description} 
                          size="md" 
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center mt-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="ml-1 text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </span>
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
              <p className="text-gray-500">No transactions yet</p>
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
      
      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;