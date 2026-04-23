const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const { generateSalesReportPDF } = require('../utils/generatePDF');

const getReportDateRange = (query) => {
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const startDate = query.startDate
        ? new Date(query.startDate)
        : new Date(new Date(endDate).setDate(endDate.getDate() - 7));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        const error = new Error('Invalid date range');
        error.statusCode = 400;
        throw error;
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        const error = new Error('Start date cannot be after end date');
        error.statusCode = 400;
        throw error;
    }

    return { startDate, endDate };
};

const getDashboardStats = async (req, res) => {
    try {
        const salesStats = await SalesOrder.aggregate([
            { $group: { _id: "$status", total: { $sum: "$totalAmount" } } }
        ]);
        const purchaseStats = await PurchaseOrder.aggregate([
            { $group: { _id: "$status", total: { $sum: "$totalAmount" } } }
        ]);
        const productCount = await Product.countDocuments();
        const lowStockCount = await Product.countDocuments({
            $expr: { $lte: ['$quantity', '$minStockLevel'] }
        });

        const getVal = (arr, status) => arr.find(s => s._id === status)?.total || 0;

        res.json({
            sales: getVal(salesStats, 'completed'),
            pendingSales: getVal(salesStats, 'pending'),
            purchases: getVal(purchaseStats, 'completed'),
            pendingPurchases: getVal(purchaseStats, 'pending'),
            products: productCount,
            lowStock: lowStockCount
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getChartData = async (req, res) => {
    try {
        const { startDate, endDate } = getReportDateRange(req.query);

        // Last 7 days sales (grouped by status)
        const rawSales = await SalesOrder.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        status: "$status"
                    },
                    amount: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Transform data into { _id: "date", completed: X, pending: Y }
        const formattedData = rawSales.reduce((acc, curr) => {
            const date = curr._id.date;
            const status = curr._id.status;
            let existing = acc.find(item => item._id === date);
            if (!existing) {
                existing = { _id: date, amount: 0, pendingAmount: 0 };
                acc.push(existing);
            }
            if (status === 'completed') {
                existing.amount = curr.amount;
            } else if (status === 'pending') {
                existing.pendingAmount = curr.amount;
            }
            return acc;
        }, []);

        res.json(formattedData);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const downloadSalesReportPDF = async (req, res) => {
    try {
        const { startDate, endDate } = getReportDateRange(req.query);
        const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

        const [orders, salesStats, rawChartData] = await Promise.all([
            SalesOrder.find(dateFilter)
                .populate('products.product', 'name')
                .populate('createdBy', 'name role')
                .sort({ createdAt: -1 }),
            SalesOrder.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$status',
                        total: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            SalesOrder.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                            status: "$status"
                        },
                        amount: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id.date": 1 } }
            ])
        ]);

        const getTotal = (status) => salesStats.find(item => item._id === status)?.total || 0;
        const getCount = (status) => salesStats.find(item => item._id === status)?.count || 0;

        const chartData = rawChartData.reduce((acc, curr) => {
            const date = curr._id.date;
            const status = curr._id.status;
            let existing = acc.find(item => item._id === date);

            if (!existing) {
                existing = { _id: date, amount: 0, pendingAmount: 0 };
                acc.push(existing);
            }

            if (status === 'completed') {
                existing.amount = curr.amount;
            } else if (status === 'pending') {
                existing.pendingAmount = curr.amount;
            }

            return acc;
        }, []);

        const pdfBuffer = generateSalesReportPDF({
            orders,
            chartData,
            generatedBy: req.user,
            dateRange: { startDate, endDate },
            stats: {
                sales: getTotal('completed'),
                pendingSales: getTotal('pending'),
                totalOrders: orders.length,
                completedOrders: getCount('completed'),
                pendingOrders: getCount('pending'),
                cancelledOrders: getCount('cancelled')
            }
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="sales-report-${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.byteLength
        });
        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};


module.exports = { getDashboardStats, getChartData, downloadSalesReportPDF };
