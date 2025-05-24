import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Mail } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const success = await register(name, email);
      if (success) {
        navigate('/');
      } else {
        setError('Account with this email already exists.');
      }
    } catch (err) {
      setError('Failed to create an account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 fade-in">
        <div className="text-center">
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 17h2.4a1 1 0 0 0 .9-.5l5-8.5a1 1 0 0 1 .9-.5h5.8a1 1 0 0 1 .9.5l5 8.5a1 1 0 0 0 .9.5H22"/>
              <path d="M19 17v4"/>
              <path d="M5 17v4"/>
              <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
            </svg>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Join SettleUp</h1>
          <p className="mt-2 text-gray-600">
            Track expenses, split bills, and settle up with friends
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Create your account</h2>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <Input
                id="name"
                type="text"
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={18} />}
                fullWidth
                required
              />
            </div>
            
            <div>
              <Input
                id="email"
                type="email"
                label="Email address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                fullWidth
                required
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              className="py-2.5"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            
            <div className="text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;