import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Barcode } from 'lucide-react';

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', sku: '', category: '', price: '', minStockLevel: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products');
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await API.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await API.put(`/products/${editingProduct._id}`, formData);
            } else {
                await API.post('/products', formData);
            }
            closeModal();
            fetchProducts();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to process request';
            alert(errorMsg);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            minStockLevel: product.minStockLevel
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', sku: '', category: '', price: '', minStockLevel: '' });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your products and stock levels</p>
                </div>
                {(user.role === 'admin' || user.role === 'inventory_manager' || user.role === 'inventory_managerr') && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add Product</span>
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, SKU, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary-500 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Product Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Status</th>
                                {(user.role === 'admin' || user.role === 'inventory_manager' || user.role === 'inventory_managerr') && <th className="px-6 py-4">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            {product.barcode && (
                                                <div className="w-12 h-8 bg-white border rounded p-1 flex items-center justify-center">
                                                    <img src={product.barcode} alt="barcode" className="max-w-full max-h-full" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{product.category}</td>
                                    <td className="px-6 py-4 font-medium">
                                        {product.quantity} units
                                    </td>
                                    <td className="px-6 py-4">₹{product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.quantity <= product.minStockLevel
                                            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                            : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {product.quantity <= product.minStockLevel ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    {(user.role === 'admin' || user.role === 'inventory_manager' || user.role === 'inventory_managerr') && (
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-lg shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold dark:text-white">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h3>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Product Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
                                    <input required placeholder="SKU" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} disabled={!!editingProduct} className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full disabled:opacity-50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
                                    <input required type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />
                                </div>
                                <input required type="number" placeholder="Min Stock Level" value={formData.minStockLevel} onChange={e => setFormData({ ...formData, minStockLevel: e.target.value })} className="p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white w-full" />

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                                        {editingProduct ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;
