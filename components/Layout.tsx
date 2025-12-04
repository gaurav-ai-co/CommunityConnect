import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Home, 
  Users, 
  CreditCard, 
  Menu, 
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Wrench,
  Car,
  Calendar,
  Contact,
  Cat
} from 'lucide-react';
import { Button } from './UI';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) {
    return <>{children}</>;
  }

  const role = user.role;

  const getLinks = () => {
    if (role === UserRole.RESIDENT) {
      return [
        { to: '/resident', icon: Home, label: 'Dashboard' },
        { to: '/resident/visitors', icon: Users, label: 'Visitors' },
        { to: '/resident/payments', icon: CreditCard, label: 'Payments' },
        { to: '/resident/complaints', icon: Wrench, label: 'Helpdesk' },
        { to: '/resident/amenities', icon: Calendar, label: 'Amenities' },
        { to: '/resident/vehicles', icon: Car, label: 'My Vehicles' },
        { to: '/resident/pets', icon: Cat, label: 'My Pets' },
        { to: '/resident/directory', icon: Contact, label: 'Directory' },
        { to: '/resident/assistant', icon: MessageSquare, label: 'AI Assistant' },
      ];
    }
    if (role === UserRole.GUARD) {
      return [
        { to: '/guard', icon: ShieldCheck, label: 'Entry/Exit' },
      ];
    }
    if (role === UserRole.ADMIN) {
      return [
        { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <ShieldCheck className="h-8 w-8 text-indigo-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">CommConnect</span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user.displayName.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 truncate w-32">{user.displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
          <div className="flex items-center">
            <ShieldCheck className="h-6 w-6 text-indigo-600 mr-2" />
            <span className="text-lg font-bold text-gray-900">CommConnect</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};