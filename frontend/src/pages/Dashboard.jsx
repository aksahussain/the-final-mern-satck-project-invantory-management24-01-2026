import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { motion } from 'framer-motion';
import { IndianRupee, Package, ShoppingBag, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ sales: 0, purchases: 0, products: 0, lowStock: 0 });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await API.get('/reports/stats');
                const chartRes = await API.get('/reports/chart');
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 dark:text-gray-400 font-medium">{title}</h3>
                <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
                    <Icon size={20} className={color.replace('bg-', 'text-')} />
                </div>
            </div>
            <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                {title.includes('Sales') && stats.pendingSales > 0 && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                        +₹{stats.pendingSales.toLocaleString()} pending
                    </span>
                )}
            </div>
        </motion.div>
    );

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, {user.name} ({user.role === 'sales' ? 'sales team' : user.role})</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Sales"
                    value={`₹${stats.sales.toLocaleString()}`}
                    icon={IndianRupee}
                    color="bg-green-500"
                    delay={0}
                />
                <StatCard
                    title="Total Purchases"
                    value={`₹${stats.purchases.toLocaleString()}`}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                    delay={0.1}
                />
                <StatCard
                    title="Product Types"
                    value={stats.products}
                    icon={Package}
                    color="bg-purple-500"
                    delay={0.2}
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    color="bg-red-500"
                    delay={0.3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Sales Trend (Last 7 Days)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="_id" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} name="Completed" />
                                <Bar dataKey="pendingAmount" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} name="Pending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Placeholder for Eco Analytics or Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {['admin', 'inventory_manager', 'inventory_managerr'].includes(user.role) && (
                            <button onClick={() => navigate('/products')} className="p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/30 transition text-left font-medium">
                                + Add New Product
                            </button>
                        )}


                        <button onClick={() => navigate('/reports')} className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition text-left font-medium">
                            View Reports
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
