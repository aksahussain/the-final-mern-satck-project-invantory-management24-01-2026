import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    TrendingUp,
    Users,
    FileText,
    MessageSquare,
    LogOut,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card';
 // add is active class so it glow
    const NavItem = ({ to, icon: Icon, label }) => (
        <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${isActive(to)}`}>
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className="h-screen w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                    IMS Pro
                </h1>
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Inventory Management System </p>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {(['admin', 'inventory_manager', 'inventory_managerr', 'sales', 'sales team', 'staff'].includes(user?.role)) && (
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                )}

                {(['admin', 'inventory_manager', 'inventory_managerr', 'sales', 'sales team', 'staff'].includes(user?.role)) && (
                    <NavItem to="/products" icon={Package} label="Products" />
                )}

                {(['admin', 'inventory_manager', 'inventory_managerr'].includes(user?.role)) && (
                    <NavItem to="/purchases" icon={ShoppingCart} label="Purchase Orders" />
                )}

                {(['admin', 'inventory_manager', 'inventory_managerr', 'sales', 'sales team', 'staff'].includes(user?.role)) && (
                    <NavItem to="/sales" icon={TrendingUp} label="Sales Orders" />
                )}

                {(['admin', 'inventory_manager', 'inventory_managerr'].includes(user?.role)) && (
                    <NavItem to="/suppliers" icon={Users} label="Suppliers" />
                )}

                {user?.role === 'admin' && (
                    <NavItem to="/users" icon={Users} label="User Management" />
                )}

                <NavItem to="/reports" icon={FileText} label="Reports" />
                <NavItem to="/chat" icon={MessageSquare} label="AI Assistant" />
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    {theme === 'dark' ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
                    <span className="text-sm font-medium dark:text-gray-200">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
