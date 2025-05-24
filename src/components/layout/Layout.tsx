import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Receipt, 
  Users, 
  CreditCard, 
  LogOut, 
  Menu, 
  X, 
  BarChart2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const navigationItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { name: 'Transactions', icon: <Receipt size={20} />, path: '/transactions' },
    { name: 'Friends', icon: <Users size={20} />, path: '/friends' },
    { name: 'Split Bills', icon: <CreditCard size={20} />, path: '/split-bills' },
    { name: 'Statistics', icon: <BarChart2 size={20} />, path: '/statistics' },
  ];
  
  const isActive = (path: string) => location.pathname === path;
  
  if (!currentUser) {
    return <div className="p-4">{children}</div>;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 17h2.4a1 1 0 0 0 .9-.5l5-8.5a1 1 0 0 1 .9-.5h5.8a1 1 0 0 1 .9.5l5 8.5a1 1 0 0 0 .9.5H22"/>
                <path d="M19 17v4"/>
                <path d="M5 17v4"/>
                <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
              </svg>
            </div>
            <h1 className="ml-2 text-xl font-bold text-gray-900">SettleUp</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <Avatar name={currentUser.name} size="md" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 mt-4 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <LogOut size={18} className="mr-3" />
            Log out
          </button>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 md:hidden">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mr-2 text-gray-600"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 17h2.4a1 1 0 0 0 .9-.5l5-8.5a1 1 0 0 1 .9-.5h5.8a1 1 0 0 1 .9.5l5 8.5a1 1 0 0 0 .9.5H22"/>
                <path d="M19 17v4"/>
                <path d="M5 17v4"/>
                <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
              </svg>
              <h1 className="ml-2 text-lg font-bold text-gray-900">SettleUp</h1>
            </div>
          </div>
          <Avatar 
            name={currentUser.name} 
            size="sm" 
            onClick={() => navigate('/profile')} 
            className="cursor-pointer"
          />
        </header>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-full max-w-xs bg-white pt-5 pb-4">
              <div className="absolute top-0 right-0 pt-2 pr-2">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 rounded-md hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="px-4 flex items-center">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 17h2.4a1 1 0 0 0 .9-.5l5-8.5a1 1 0 0 1 .9-.5h5.8a1 1 0 0 1 .9.5l5 8.5a1 1 0 0 0 .9.5H22"/>
                    <path d="M19 17v4"/>
                    <path d="M5 17v4"/>
                    <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
                  </svg>
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-900">SettleUp</h1>
              </div>
              
              <div className="mt-5 flex-1 px-2 overflow-y-auto">
                <nav className="flex-1">
                  <ul className="space-y-1 px-2">
                    {navigationItems.map((item) => (
                      <li key={item.name}>
                        <button
                          onClick={() => navigate(item.path)}
                          className={`flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive(item.path)
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              
              <div className="px-4 pt-4 pb-2 border-t border-gray-200">
                <div className="flex items-center">
                  <Avatar name={currentUser.name} size="md" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 mt-4 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <LogOut size={18} className="mr-3" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
          {navigationItems.slice(0, 4).map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="mb-1">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;