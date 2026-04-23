import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data } = await API.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            console.error("Failed to fetch suppliers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/suppliers', formData);
            setIsModalOpen(false);
            fetchSuppliers();
            setFormData({ name: '', email: '', phone: '', address: '' });
        } catch (error) {
            alert('Failed to create supplier');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this supplier?')) {
            try {
                await API.delete(`/suppliers/${id}`);
                fetchSuppliers();
            } catch (error) {
                alert('Failed to delete');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage vendor relationships</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Supplier</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                    <motion.div
                        key={supplier._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <Users className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <button onClick={() => handleDelete(supplier._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{supplier.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{supplier.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{supplier.phone}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{supplier.address}</p>
                        </div>
                    </motion.div>
                ))}
                {suppliers.length === 0 && !loading && (
                    <div className="col-span-3 text-center py-10 text-gray-500">
                        No suppliers found. Add one to get started.
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-6 dark:text-white">Add Supplier</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <input required placeholder="Company Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                                <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                                <input required placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
                                <textarea placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white h-24" />

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Suppliers;
