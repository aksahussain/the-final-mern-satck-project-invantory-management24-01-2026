import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Plus, FileText, X, Check, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sales = () => {

    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [downloadingProductReport, setDownloadingProductReport] = useState(false);
    const [downloadingFilteredReport, setDownloadingFilteredReport] = useState(false);
    const [filters, setFilters] = useState({ keyword: '', date: '', productId: '' });
    const [formData, setFormData] = useState({
        customerName: '',
        products: [{ product: '', quantity: 1, sellingPrice: 0 }],
    });

    useEffect(() => {
        console.log("Current user role:", user?.role);
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                API.get('/orders/sales'),
                API.get('/products')
            ]);
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        try {
            // Filter out empty rows if any
            const validProducts = formData.products.filter(p => p.product && p.quantity > 0);
            if (validProducts.length === 0) {
                alert('Please add at least one product');
                return;
            }

            const totalAmount = validProducts.reduce((acc, item) => acc + (item.quantity * item.sellingPrice), 0);
            await API.post('/orders/sales', { ...formData, products: validProducts, totalAmount });
            setIsModalOpen(false);
            fetchData();
            setFormData({ customerName: '', products: [{ product: '', quantity: 1, sellingPrice: 0 }] });
            alert('Sale order created as Pending. Wait for manager approval.');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create sale');
        }
    };

    const handleActivateSale = async (id) => {
        if (!window.confirm('Mark this sale as completed and reduce stock?')) return;
        try {
            await API.put(`/orders/sales/status/${id}`, { status: 'completed' });
            alert('Sale completed and stock updated!');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to complete sale');
        }
    };

    const handleDeleteSale = async (id) => {
        if (!window.confirm('Are you sure you want to delete this sale order?')) return;
        try {
            await API.delete(`/orders/sales/${id}`);
            alert('Sale order deleted successfully');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete sale order');
        }
    };

    const addProductRow = () => {
        setFormData({
            ...formData,
            products: [...formData.products, { product: '', quantity: 1, sellingPrice: 0 }]
        });
    };

    const removeProductRow = (index) => {
        if (formData.products.length > 1) {
            const newProducts = formData.products.filter((_, i) => i !== index);
            setFormData({ ...formData, products: newProducts });
        }
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...formData.products];
        newProducts[index][field] = value;

        // Auto-set price if product selected
        if (field === 'product') {
            const prod = products.find(p => p._id === value);
            if (prod) newProducts[index].sellingPrice = prod.price;
        }

        setFormData({ ...formData, products: newProducts });
    };

    const downloadInvoice = async (id) => {
        try {
            const response = await API.get(`/orders/invoice/sales/${id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Failed to download invoice", error);
        }
    };

    const downloadProductSalesReport = async () => {
        try {
            setDownloadingProductReport(true);
            const response = await API.get('/orders/sales/product-report/pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `product-sales-report-${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download product sales report", error);
            alert('Failed to download product sales report');
        } finally {
            setDownloadingProductReport(false);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const keyword = filters.keyword.trim().toLowerCase();
        const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
        const matchesDate = !filters.date || orderDate === filters.date;
        const matchesProduct = !filters.productId || (order.products || []).some((item) => {
            const itemProductId = item.product?._id || item.product;
            return itemProductId === filters.productId;
        });
        const searchableText = [
            order._id,
            order.customerName,
            order.status,
            ...(order.products || []).map(item => item.product?.name)
        ].filter(Boolean).join(' ').toLowerCase();

        return matchesDate && matchesProduct && (!keyword || searchableText.includes(keyword));
    });

    const getOrderDetails = (order) => {
        const items = filters.productId
            ? (order.products || []).filter((item) => (item.product?._id || item.product) === filters.productId)
            : (order.products || []);

        return items.map((item) => {
            const productName = item.product?.name || 'Unknown Product';
            return `${productName} x ${item.quantity}`;
        }).join(', ');
    };

    const downloadFilteredReport = async () => {
        try {
            setDownloadingFilteredReport(true);
            const params = new URLSearchParams();
            if (filters.keyword.trim()) params.append('keyword', filters.keyword.trim());
            if (filters.date) params.append('date', filters.date);
            if (filters.productId) params.append('productId', filters.productId);

            const response = await API.get(`/orders/sales/report/pdf?${params.toString()}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `sales-orders-${new Date().toISOString().slice(0, 10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download sales report", error);
            alert('Failed to download sales report');
        } finally {
            setDownloadingFilteredReport(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Orders</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage outgoing stock</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={downloadFilteredReport}
                        disabled={downloadingFilteredReport}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <FileText size={20} />
                        <span>{downloadingFilteredReport ? 'Generating...' : 'Filtered PDF'}</span>
                    </button>
                    <button
                        onClick={downloadProductSalesReport}
                        disabled={downloadingProductReport}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <FileText size={20} />
                        <span>{downloadingProductReport ? 'Generating...' : 'Product Sales PDF'}</span>
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>New Sale</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_minmax(180px,240px)_auto]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search customer, product, status, or order ID"
                                value={filters.keyword}
                                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                        />
                        <select
                            value={filters.productId}
                            onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
                            className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All products</option>
                            {products.map((product) => (
                                <option key={product._id} value={product._id}>{product.name}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setFilters({ keyword: '', date: '', productId: '' })}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Clear
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Showing {filteredOrders.length} of {orders.length} sales orders
                    </p>
                </div>
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Order Detail</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-mono text-xs">{order._id.substring(0, 8)}...</td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{order.customerName}</td>
                                <td className="px-6 py-4 max-w-xs">
                                    <span className="line-clamp-2" title={getOrderDetails(order)}>
                                        {getOrderDetails(order)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">₹{order.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <button onClick={() => downloadInvoice(order._id)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400" title="Download Invoice">
                                            <FileText size={18} />
                                        </button>
                                        {['admin', 'inventory_manager', 'inventory_managerr', 'manager'].includes(user?.role?.toLowerCase()?.trim()) && order.status === 'pending' && (
                                            <button
                                                onClick={() => handleActivateSale(order._id)}
                                                className="text-green-600 hover:text-green-800 dark:text-green-400"
                                                title="Complete Sale (Reduce Stock)"
                                            >
                                                <Check size={18} />
                                            </button>
                                        )}
                                        {['admin', 'inventory_manager', 'inventory_managerr', 'manager'].includes(user?.role?.toLowerCase()?.trim()) && (
                                            <button
                                                onClick={() => handleDeleteSale(order._id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400"
                                                title="Delete Sale Order"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-2xl shadow-2xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-6 dark:text-white">Create Sales Order</h3>
                            <form onSubmit={handleCreateOrder} className="space-y-4">
                                <input
                                    className="w-full p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    placeholder="Customer Name"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    required
                                />

                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Items</h4>
                                        <button
                                            type="button"
                                            onClick={addProductRow}
                                            className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-1 rounded hover:bg-primary-100 transition"
                                        >
                                            + Add Item
                                        </button>
                                    </div>
                                    {formData.products.map((item, index) => (
                                        <div key={index} className="flex space-x-2 items-start bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                            <div className="flex-1">
                                                <select
                                                    className="w-full p-2 text-sm rounded-lg border dark:bg-gray-800 dark:text-white"
                                                    value={item.product}
                                                    onChange={(e) => handleProductChange(index, 'product', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantity})</option>)}
                                                </select>
                                            </div>
                                            <div className="w-20">
                                                <input
                                                    type="number"
                                                    className="w-full p-2 text-sm rounded-lg border dark:bg-gray-800 dark:text-white"
                                                    placeholder="Qty"
                                                    value={item.quantity}
                                                    onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                                                    required
                                                    min="1"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    className="w-full p-2 text-sm rounded-lg border dark:bg-gray-800 dark:text-white"
                                                    placeholder="Price"
                                                    value={item.sellingPrice}
                                                    onChange={(e) => handleProductChange(index, 'sellingPrice', parseFloat(e.target.value))}
                                                    required
                                                />
                                            </div>
                                            {formData.products.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductRow(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t dark:border-gray-700 pt-4 mt-4">
                                    <div className="flex justify-between items-center text-lg font-bold dark:text-white">
                                        <span>Total Amount:</span>
                                        <span>₹{formData.products.reduce((acc, item) => acc + (item.quantity * (item.sellingPrice || 0)), 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">Create Sale Order</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Sales;
