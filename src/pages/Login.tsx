import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      const success = await login(email);
      if (success) {
        navigate('/');
      } else {
        setError('Account not found. Please check your email or register.');
      }
    } catch (err) {
      setError('Failed to log in. Please try again.');
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
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Welcome to SettleUp</h1>
          <p className="mt-2 text-gray-600">
            Track money between friends and split bills easily
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Sign in to your account</h2>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            
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
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            
            <div className="text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Register now
                </Link>
              </p>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Account</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setEmail('demo@example.com');
                }}
                className="text-gray-700"
              >
                Use Demo Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;