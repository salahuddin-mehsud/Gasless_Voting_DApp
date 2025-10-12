import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/helpers.js';

const Navigation = ({ className }) => {
  const location = useLocation();

  const tabs = [
    { name: 'Active Polls', href: '/polls', current: location.pathname === '/polls' },
    { name: 'My Polls', href: '/dashboard', current: location.pathname === '/dashboard' },
    { name: 'My Votes', href: '/votes', current: location.pathname === '/votes' }, // ADD THIS TAB
  ];

  return (
    <nav className={className}>
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name} // ADD KEY PROP
              to={tab.href}
              className={cn(
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                tab.current
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;