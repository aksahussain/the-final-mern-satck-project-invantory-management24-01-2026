const PurchaseOrder = require('../models/PurchaseOrder');
const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const { generateInvoicePDF, generateProductSalesReportPDF, generateFilteredOrdersPDF } = require('../utils/generatePDF');

const matchesOrderDate = (order, date) => {
    if (!date) return true;
    return new Date(order.createdAt).toISOString().slice(0, 10) === date;
};

const matchesKeyword = (order, keyword, type) => {
    if (!keyword) return true;

    const normalizedKeyword = keyword.toLowerCase();
    const searchableValues = [
        order._id?.toString(),
        order.status,
        type === 'sales' ? order.customerName : order.supplier?.name,
        ...order.products.map(item => item.product?.name)
    ];

    return searchableValues
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(normalizedKeyword));
};

const matchesProduct = (order, productId) => {
    if (!productId) return true;
    return order.products.some(item => {
        const itemProductId = item.product?._id?.toString() || item.product?.toString();
        return itemProductId === productId;
    });
};

const filterOrders = (orders, { keyword, date, productId, type }) => {
    return orders.filter(order =>
        matchesOrderDate(order, date) &&
        matchesKeyword(order, keyword, type) &&
        matchesProduct(order, productId)
    );
};

// Purchase Order (Stock IN)
const createPurchaseOrder = async (req, res) => {
    const { supplier, products, totalAmount } = req.body;

    try {
        const order = await PurchaseOrder.create({
            supplier,
            products,
            totalAmount,
            createdBy: req.user._id,
            status: 'pending' // Explictly set to pending
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPurchaseOrders = async (req, res) => {
    try {
        const orders = await PurchaseOrder.find({})
            .populate('supplier', 'name')
            .populate('products.product', 'name')
            .populate('createdBy', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Sales Order (Stock OUT)
const createSalesOrder = async (req, res) => {
    const { customerName, products, totalAmount } = req.body;

    try {
        // NOTE: Stock check is now primarily handled in updateSalesStatus (completion).
        // This allows creating pending orders for items out of stock, which can be fulfilled later.
        /*
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product || product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ${product ? product.name : item.product}` });
            }
        }
        */

        const order = await SalesOrder.create({
            customerName,
            products,
            totalAmount,
            createdBy: req.user._id,
            status: 'pending' // Explicitly set to pending
        });

        // NOTE: Stock reduction and logs are now handled in updateSalesStatus
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSalesOrders = async (req, res) => {
    try {
        const orders = await SalesOrder.find({})
            .populate('products.product', 'name')
            .populate('createdBy', 'name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Purchase Order Status (Activation)
const updatePurchaseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await PurchaseOrder.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'pending') {
            return res.status(400).json({ message: `Order is already ${order.status}` });
        }

        if (status === 'completed') {
            // Update Stock & Create Logs
            for (const item of order.products) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.quantity += item.quantity;
                    await product.save();

                    await StockLog.create({
                        product: item.product,
                        type: 'IN',
                        quantity: item.quantity,
                        reason: `Purchase Order Activation #${order._id}`,
                        performedBy: req.user._id
                    });
                }
            }
        }

        order.status = status;
        await order.save();
        res.json({ message: `Order marked as ${status}`, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Sales Order Status (Verification)
const updateSalesStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await SalesOrder.findById(id);
        if (!order) return res.status(404).json({ message: 'Sales order not found' });

        if (order.status !== 'pending') {
            return res.status(400).json({ message: `Order is already ${order.status}` });
        }

        if (status === 'completed') {
            // Update Stock & Create Logs
            for (const item of order.products) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.quantity -= item.quantity;
                    await product.save();

                    await StockLog.create({
                        product: item.product,
                        type: 'OUT',
                        quantity: item.quantity,
                        reason: `Sales Order Completion #${order._id}`,
                        performedBy: req.user._id
                    });
                }
            }
        }

        order.status = status;
        await order.save();
        res.json({ message: `Sale marked as ${status}`, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate Invoice PDF
const getInvoice = async (req, res) => {
    try {
        const { type, id } = req.params; // type: 'sales' or 'purchase'
        let order;

        if (type === 'sales') {
            order = await SalesOrder.findById(id).populate('products.product', 'name price');
        } else {
            order = await PurchaseOrder.findById(id).populate('products.product', 'name price');
        }

        if (!order) return res.status(404).json({ message: 'Order not found' });

        const pdfBuffer = generateInvoicePDF(order, type === 'sales' ? 'Sales' : 'Purchase');

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.byteLength,
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductSalesReport = async (req, res) => {
    try {
        const orders = await SalesOrder.find({})
            .populate('products.product', 'name')
            .sort({ createdAt: -1 });

        const productSalesMap = orders.reduce((summary, order) => {
            order.products.forEach((item) => {
                const productId = item.product?._id?.toString() || item.product?.toString();
                const productName = item.product?.name || 'Unknown Product';
                const quantity = Number(item.quantity) || 0;
                const sellingPrice = Number(item.sellingPrice) || 0;

                if (!summary[productId]) {
                    summary[productId] = {
                        productName,
                        totalQuantity: 0,
                        completedQuantity: 0,
                        pendingQuantity: 0,
                        cancelledQuantity: 0,
                        completedRevenue: 0
                    };
                }

                summary[productId].totalQuantity += quantity;

                if (order.status === 'completed') {
                    summary[productId].completedQuantity += quantity;
                    summary[productId].completedRevenue += quantity * sellingPrice;
                } else if (order.status === 'pending') {
                    summary[productId].pendingQuantity += quantity;
                } else if (order.status === 'cancelled') {
                    summary[productId].cancelledQuantity += quantity;
                }
            });

            return summary;
        }, {});

        const productSales = Object.values(productSalesMap)
            .sort((a, b) => b.completedQuantity - a.completedQuantity || b.totalQuantity - a.totalQuantity);

        const pdfBuffer = generateProductSalesReportPDF({
            productSales,
            generatedBy: req.user
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="product-sales-report-${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.byteLength
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFilteredPurchaseReport = async (req, res) => {
    try {
        const { keyword = '', date = '' } = req.query;
        const orders = await PurchaseOrder.find({})
            .populate('supplier', 'name')
            .populate('products.product', 'name')
            .sort({ createdAt: -1 });

        const filteredOrders = filterOrders(orders, {
            keyword: keyword.trim(),
            date,
            type: 'purchase'
        });

        const pdfBuffer = generateFilteredOrdersPDF({
            title: 'Filtered Purchase Orders Report',
            orders: filteredOrders,
            type: 'purchase',
            generatedBy: req.user,
            filters: { keyword: keyword.trim(), date }
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="purchase-orders-report-${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.byteLength
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFilteredSalesReport = async (req, res) => {
    try {
        const { keyword = '', date = '', productId = '' } = req.query;
        const orders = await SalesOrder.find({})
            .populate('products.product', 'name')
            .sort({ createdAt: -1 });

        const filteredOrders = filterOrders(orders, {
            keyword: keyword.trim(),
            date,
            productId,
            type: 'sales'
        });

        const selectedProduct = productId ? await Product.findById(productId).select('name') : null;

        const pdfBuffer = generateFilteredOrdersPDF({
            title: 'Filtered Sales Orders Report',
            orders: filteredOrders,
            type: 'sales',
            generatedBy: req.user,
            filters: {
                keyword: keyword.trim(),
                date,
                productId,
                productName: selectedProduct?.name || ''
            }
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="sales-orders-report-${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.byteLength
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Purchase Order
const deletePurchaseOrder = async (req, res) => {
    try {
        const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Purchase order not found' });
        res.json({ message: 'Purchase order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Sales Order
const deleteSalesOrder = async (req, res) => {
    try {
        const order = await SalesOrder.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Sales order not found' });
        res.json({ message: 'Sales order deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPurchaseOrder,
    getPurchaseOrders,
    updatePurchaseStatus,
    updateSalesStatus,
    createSalesOrder,
    getSalesOrders,
    getInvoice,
    getProductSalesReport,
    getFilteredPurchaseReport,
    getFilteredSalesReport,
    deletePurchaseOrder,
    deleteSalesOrder
};

