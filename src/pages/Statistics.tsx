import React, { useState, useMemo } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowDown, ArrowUp, CreditCard, TrendingUp, Users, Calendar } from 'lucide-react';
import { Transaction } from '../types';

const Statistics: React.FC = () => {
  const { transactions } = useTransactions();
  const { currentUser, users } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  
  // Filter transactions by time range
  const filteredTransactions = useMemo(() => {
    if (!currentUser) return [];
    
    const now = new Date();
    let cutoffDate = new Date();
    
    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    } else {
      cutoffDate = new Date(0); // Beginning of time
    }
    
    return transactions.filter(t => 
      (t.payerId === currentUser.id || t.payeeId === currentUser.id) &&
      new Date(t.date) >= cutoffDate
    );
  }, [transactions, currentUser, timeRange]);
  
  // Calculate total amounts
  const totals = useMemo(() => {
    if (!currentUser) return { spent: 0, received: 0, netTotal: 0 };
    
    let spent = 0;
    let received = 0;
    
    filteredTransactions.forEach(t => {
      if (t.payerId === currentUser.id) {
        spent += t.amount;
      } else if (t.payeeId === currentUser.id) {
        received += t.amount;
      }
    });
    
    return {
      spent,
      received,
      netTotal: received - spent
    };
  }, [filteredTransactions, currentUser]);
  
  // Calculate statistics by person
  const statsByPerson = useMemo(() => {
    if (!currentUser) return [];
    
    const personStats = new Map<string, { spent: number, received: number, name: string }>();
    
    // Initialize map with friends
    users.forEach(user => {
      if (currentUser.friends.includes(user.id)) {
        personStats.set(user.id, { spent: 0, received: 0, name: user.name });
      }
    });
    
    // Calculate amounts
    filteredTransactions.forEach(t => {
      if (t.payerId === currentUser.id) {
        // Current user paid
        const otherPerson = t.payeeId;
        if (personStats.has(otherPerson)) {
          const stats = personStats.get(otherPerson)!;
          stats.spent += t.amount;
          personStats.set(otherPerson, stats);
        }
      } else if (t.payeeId === currentUser.id) {
        // Current user received
        const otherPerson = t.payerId;
        if (personStats.has(otherPerson)) {
          const stats = personStats.get(otherPerson)!;
          stats.received += t.amount;
          personStats.set(otherPerson, stats);
        }
      }
    });
    
    // Convert to array and calculate net
    return Array.from(personStats.entries())
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        spent: stats.spent,
        received: stats.received,
        net: stats.received - stats.spent
      }))
      .filter(p => p.spent > 0 || p.received > 0) // Only include people with transactions
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net)); // Sort by absolute net value
  }, [filteredTransactions, currentUser, users]);
  
  // Group transactions by category for a simple chart
  const categoryCounts = useMemo(() => {
    const counts = { lend: 0, borrow: 0, split: 0 };
    
    filteredTransactions.forEach(t => {
      if (t.category === 'lend') counts.lend++;
      else if (t.category === 'borrow') counts.borrow++;
      else if (t.category === 'split') counts.split++;
    });
    
    const total = counts.lend + counts.borrow + counts.split;
    
    return {
      counts,
      percentages: {
        lend: total > 0 ? Math.round((counts.lend / total) * 100) : 0,
        borrow: total > 0 ? Math.round((counts.borrow / total) * 100) : 0,
        split: total > 0 ? Math.round((counts.split / total) * 100) : 0,
      }
    };
  }, [filteredTransactions]);
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <p className="text-gray-600">Analyze your transaction patterns</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={timeRange === 'week' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === 'month' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button 
            variant={timeRange === 'year' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setTimeRange('year')}
          >
            Year
          </Button>
          <Button 
            variant={timeRange === 'all' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            All Time
          </Button>
        </div>
      </header>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <ArrowUp size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-900">${totals.spent.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ArrowDown size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
              <p className="text-2xl font-bold text-gray-900">${totals.received.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Net Balance</h3>
              <p className={`text-2xl font-bold ${
                totals.netTotal > 0 
                  ? 'text-green-600' 
                  : totals.netTotal < 0 
                    ? 'text-red-600' 
                    : 'text-gray-900'
              }`}>
                {totals.netTotal > 0 ? '+' : ''}${totals.netTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions by Type */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Transactions by Type</h2>
          
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-600">Lent</div>
                <div className="flex-1">
                  <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${categoryCounts.percentages.lend}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 w-16 text-right text-sm font-medium">
                  {categoryCounts.percentages.lend}%
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-600">Borrowed</div>
                <div className="flex-1">
                  <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${categoryCounts.percentages.borrow}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 w-16 text-right text-sm font-medium">
                  {categoryCounts.percentages.borrow}%
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-24 text-sm text-gray-600">Split Bills</div>
                <div className="flex-1">
                  <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${categoryCounts.percentages.split}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 w-16 text-right text-sm font-medium">
                  {categoryCounts.percentages.split}%
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Lent</p>
                  <p className="text-lg font-semibold">{categoryCounts.counts.lend}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Borrowed</p>
                  <p className="text-lg font-semibold">{categoryCounts.counts.borrow}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Split Bills</p>
                  <p className="text-lg font-semibold">{categoryCounts.counts.split}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">No transaction data available</p>
            </div>
          )}
        </Card>
        
        {/* Top People */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Transaction Activity by Person</h2>
          
          {statsByPerson.length > 0 ? (
            <div className="space-y-4">
              {statsByPerson.slice(0, 5).map(person => (
                <div key={person.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{person.name}</div>
                    <div className={`text-sm font-medium ${
                      person.net > 0 
                        ? 'text-green-600' 
                        : person.net < 0 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}>
                      {person.net > 0 ? 'Owes you' : person.net < 0 ? 'You owe' : 'Settled'} 
                      {person.net !== 0 && ` $${Math.abs(person.net).toFixed(2)}`}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">You lent:</span>
                      <span className="font-medium">${person.spent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">You borrowed:</span>
                      <span className="font-medium">${person.received.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">No transaction data available</p>
            </div>
          )}
        </Card>
        
        {/* Recent Activity */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map(transaction => {
                      const isOutgoing = transaction.payerId === currentUser?.id;
                      return (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.category === 'lend' 
                                ? 'bg-green-100 text-green-800' 
                                : transaction.category === 'borrow' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {transaction.category === 'lend' ? 'Lent' : 
                               transaction.category === 'borrow' ? 'Borrowed' : 'Split Bill'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <span className={isOutgoing ? 'text-red-600' : 'text-green-600'}>
                              {isOutgoing ? '-' : '+'}${transaction.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {transaction.settled ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Settled
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">No transaction data available for the selected time period</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Statistics;