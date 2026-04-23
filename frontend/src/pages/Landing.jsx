import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Shield, Zap, Package } from 'lucide-react';
import MagicCursor from '../components/MagicCursor';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            <MagicCursor />
            {/* Navbar */}
            <nav className="bg-white dark:bg-dark-card shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary-600 p-2 rounded-lg">
                                <Package className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">InventoPro</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
                                Login
                            </Link>
                            <Link to="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
                    >
                        Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Inventory</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
                    >
                        Streamline your business operations with our powerful, intuitive, and secure inventory management system. Track stock, sales, and purchases in real-time.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex justify-center space-x-4"
                    >
                        <Link to="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center transition-all transform hover:scale-105 shadow-lg shadow-primary-500/30">
                            Start Free Trial <ArrowRight className="ml-2" size={20} />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white dark:bg-dark-card py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose InventoPro?</h2>
                        <p className="text-gray-500 dark:text-gray-400">Everything you need to manage your inventory efficiently.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="text-yellow-500" size={32} />}
                            title="Real-Time Tracking"
                            description="Monitor stock levels, movements, and valuations instantly. Never run out of stock again."
                        />
                        <FeatureCard
                            icon={<BarChart2 className="text-blue-500" size={32} />}
                            title="Advanced Analytics"
                            description="Gain insights into best-selling products, revenue trends, and supplier performance."
                        />
                        <FeatureCard
                            icon={<Shield className="text-green-500" size={32} />}
                            title="Secure Role Access"
                            description="Control who sees what. granular role-based access control for Admins, Managers, and Sales."
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Package className="text-primary-500" size={24} />
                        <span className="text-xl font-bold">InventoPro</span>
                    </div>
                    <div className="text-gray-400 text-sm">
                        © 2026 InventoPro. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl"
    >
        <div className="bg-white dark:bg-gray-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
        </p>
    </motion.div>
);

export default Landing;
