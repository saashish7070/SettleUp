import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import { Plus, Calendar, Search, Filter } from 'lucide-react';
import AddTransactionModal from '../components/transactions/AddTransactionModal';

const Transactions: React.FC = () => {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lend' | 'borrow' | 'settled'>('all');
  const { transactions } = useTransactions();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Filter and sort transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Apply search filter
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply type filter
    let matchesType = true;
    if (filterType === 'lend') {
      matchesType = transaction.category === 'lend' && transaction.payerId === currentUser?.id;
    } else if (filterType === 'borrow') {
      matchesType = transaction.category === 'borrow' && transaction.payeeId === currentUser?.id;
    } else if (filterType === 'settled') {
      matchesType = transaction.settled;
    }
    
    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your transaction history</p>
        </div>
        <Button 
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => setIsAddTransactionModalOpen(true)}
        >
          Add Transaction
        </Button>
      </header>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filterType === 'all' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button 
            variant={filterType === 'lend' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setFilterType('lend')}
          >
            Lent
          </Button>
          <Button 
            variant={filterType === 'borrow' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setFilterType('borrow')}
          >
            Borrowed
          </Button>
          <Button 
            variant={filterType === 'settled' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setFilterType('settled')}
          >
            Settled
          </Button>
        </div>
      </div>
      
      {/* Transaction List */}
      <Card className="overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => {
              const isOutgoing = transaction.payerId === currentUser?.id;
              
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
                        {transaction.category === 'split' 
                          ? 'Split bill' 
                          : isOutgoing ? 'You paid' : 'You received'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              {searchQuery 
                ? 'No transactions found matching your search' 
                : 'No transactions yet'}
            </p>
            {!searchQuery && (
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsAddTransactionModalOpen(true)}
              >
                Add your first transaction
              </Button>
            )}
          </div>
        )}
      </Card>
      
      {/* Add Transaction Modal */}
      <AddTransactionModal 
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
      />
    </div>
  );
};

export default Transactions;