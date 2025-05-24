import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactions } from '../contexts/TransactionContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Check, 
  Trash2, 
  Edit, 
  User,
  Clock
} from 'lucide-react';
import { Transaction } from '../types';
import { format } from 'date-fns';

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { transactions, settleTransaction, removeTransaction } = useTransactions();
  const { currentUser, users } = useAuth();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [otherUser, setOtherUser] = useState<typeof users[0] | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundTransaction = transactions.find(t => t.id === id);
      if (foundTransaction) {
        setTransaction(foundTransaction);
        
        // Find the other user in this transaction
        const otherUserId = foundTransaction.payerId === currentUser?.id 
          ? foundTransaction.payeeId 
          : foundTransaction.payerId;
        
        const foundUser = users.find(u => u.id === otherUserId);
        if (foundUser) {
          setOtherUser(foundUser);
        }
      } else {
        // Transaction not found, navigate back
        navigate('/transactions');
      }
    }
  }, [id, transactions, currentUser, users, navigate]);
  
  if (!transaction || !currentUser) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  const isOutgoing = transaction.payerId === currentUser.id;
  const formattedDate = format(new Date(transaction.date), 'MMMM d, yyyy');
  const formattedTime = format(new Date(transaction.date), 'h:mm a');
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const success = await removeTransaction(transaction.id);
      if (success) {
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleSettle = async () => {
    setIsSettling(true);
    
    try {
      const success = await settleTransaction(transaction.id);
      if (success) {
        // Refresh transaction data
        const updatedTransaction = transactions.find(t => t.id === id);
        if (updatedTransaction) {
          setTransaction(updatedTransaction);
        }
      }
    } catch (error) {
      console.error('Error settling transaction:', error);
    } finally {
      setIsSettling(false);
      setIsSettleModalOpen(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back</span>
        </button>
      </div>
      
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{transaction.description}</h1>
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar size={14} className="mr-1" />
                <span>{formattedDate}</span>
                <span className="mx-2">•</span>
                <Clock size={14} className="mr-1" />
                <span>{formattedTime}</span>
              </div>
            </div>
            <div className={`text-xl font-bold ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
              {isOutgoing ? '-' : '+'}${transaction.amount.toFixed(2)}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex items-center mb-4">
              <div className="mr-3">
                <Avatar name={otherUser?.name || 'Unknown'} size="lg" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{otherUser?.name || 'Unknown'}</h3>
                <p className="text-sm text-gray-500">
                  {isOutgoing ? 'You paid' : 'Paid you'}
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transaction Type</p>
                  <p className="font-medium text-gray-900 capitalize">{transaction.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center">
                    {transaction.settled ? (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="font-medium text-green-700">Settled</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        <span className="font-medium text-yellow-700">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {!transaction.settled && (
              <Button 
                variant="success"
                icon={<Check size={18} />}
                fullWidth
                onClick={() => setIsSettleModalOpen(true)}
              >
                Mark as Settled
              </Button>
            )}
            <Button 
              variant="secondary"
              icon={<Edit size={18} />}
              fullWidth
              onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
            >
              Edit
            </Button>
            <Button 
              variant="error"
              icon={<Trash2 size={18} />}
              fullWidth
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transaction"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="error" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
      </Modal>
      
      {/* Settle Confirmation Modal */}
      <Modal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        title="Mark as Settled"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setIsSettleModalOpen(false)}
              disabled={isSettling}
            >
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={handleSettle}
              disabled={isSettling}
            >
              {isSettling ? 'Processing...' : 'Confirm'}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Mark this transaction as settled? This will update the balance between you and {otherUser?.name}.
        </p>
      </Modal>
    </div>
  );
};

export default TransactionDetail;