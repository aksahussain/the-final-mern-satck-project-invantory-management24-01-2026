import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';






const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('sales team'); // Default role
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/register', { name, email, password, role });
            setError('');
            setSuccess(data.message || 'Your request has been sent to the admin. Admin will accept it within the next 24 hours.');
            setName('');
            setEmail('');
            setPassword('');
            setRole('sales team');
        } catch (err) {
            setSuccess('');
            setError(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
       <div className="min-h-screen flex bg-white dark:bg-dark-bg transition-all duration-700 overflow-hidden">
          

            {/* Floating Back Button */}
            <Link
                to="/"
                className="absolute top-8 left-8 z-50 flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-500 backdrop-blur-md border bg-white/50 dark:bg-black/30 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-white dark:hover:bg-black/50 hover:text-primary-600 dark:hover:text-white"
            >
                <ArrowLeft size={18} />
                <span className="text-sm font-bold">Back</span>
            </Link>

            <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative bg-white dark:bg-dark-card border-r border-gray-100 dark:border-gray-800">
                <div
                    className="absolute top-12 left-12 flex items-center space-x-2 opacity-0 pointer-events-none"
                >
                    <div className="bg-primary-600 p-2 rounded-lg">
                        <User className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">InventoPro</span>
                </div>

             

                <div
                    className="mt-auto text-center max-w-sm"
                >
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Join our community</h3>
                    <p className="text-gray-500 dark:text-gray-400">Streamline your inventory and boost your sales with our smart management system.</p>
                </div>
            </div>

            {/* Right Side: Signup Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative bg-gray-50 dark:bg-dark-bg">
                {/* Mobile Logo */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center space-x-2">
                    <div className="bg-primary-600 p-2 rounded-lg">
                        <User className="text-white" size={20} />
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">InventoPro</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-md w-full"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            Get Started
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Create your account to join the team</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 text-center shadow-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 rounded-xl text-sm mb-6 text-center shadow-sm"
                        >
                            {success}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white shadow-sm"
                                required
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white shadow-sm"
                            >
                                <option value="sales team">Sales Team</option>
                                <option value="inventory_manager">Inventory Manager</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/20 mt-6"
                        >
                            <span>Sign Up Now</span>
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm">
                        <p className="text-gray-500 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold ml-1">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Mobile Mascot View */}
                <div className="lg:hidden mt-12 scale-75">
                   
                </div>
            </div>
        </div>
    );
};

export default Signup;
