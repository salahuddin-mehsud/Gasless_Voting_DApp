import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Vote, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useWeb3 } from '../../contexts/Web3Context.jsx';
import { formatAddress } from '../../utils/helpers.js';
import Button from '../ui/Button.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Polls', href: '/polls', current: location.pathname === '/polls' },
    ...(isAuthenticated ? [
      { name: 'Create Poll', href: '/create', current: location.pathname === '/create' },
      { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
    ] : []),
  ];

  const handleWalletConnect = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  const handleLogout = () => {
    logout();
    disconnectWallet();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Vote className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Gasless Vote</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wallet Connection */}
            <Button
              variant={isConnected ? "outline" : "primary"}
              size="sm"
              onClick={handleWalletConnect}
            >
              {isConnected ? formatAddress(account) : 'Connect Wallet'}
            </Button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.username}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 slide-in">
            <div className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-base font-medium ${
                    item.current
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Wallet Connection */}
              <div className="px-3 py-2">
                <Button
                  variant={isConnected ? "outline" : "primary"}
                  size="sm"
                  onClick={handleWalletConnect}
                  className="w-full justify-center"
                >
                  {isConnected ? formatAddress(account) : 'Connect Wallet'}
                </Button>
              </div>

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="px-3 py-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user?.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-center"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 border-t border-gray-200 space-y-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full justify-center">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;