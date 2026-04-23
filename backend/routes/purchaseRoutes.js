const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Purchase Routes (Stock IN) - Admin & Inventory Manager
router.route('/purchase')
    .post(protect, authorize('admin', 'inventory_manager'), createPurchaseOrder)
    .get(protect, authorize('admin', 'inventory_manager'), getPurchaseOrders);

router.route('/purchase/:id')
    .delete(protect, authorize('admin', 'inventory_manager'), deletePurchaseOrder);

router.route('/purchase/status/:id')
    .put(protect, authorize('admin', 'inventory_manager'), updatePurchaseStatus);

// Sales Routes (Stock OUT) - Admin & Sales
router.route('/sales')
    .post(protect, authorize('admin', 'sales', 'sales team', 'inventory_manager', 'inventory_managerr'), createSalesOrder)
    .get(protect, authorize('admin', 'inventory_manager', 'inventory_managerr', 'sales', 'sales team'), getSalesOrders);

router.route('/sales/:id')
    .delete(protect, authorize('admin', 'inventory_manager', 'inventory_managerr', 'sales', 'sales team'), deleteSalesOrder);

router.route('/sales/status/:id')
    .put(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), updateSalesStatus);


// Invoice
router.get('/invoice/:type/:id', protect, getInvoice);
router.get('/sales/product-report/pdf', protect, getProductSalesReport);
router.get('/purchase/report/pdf', protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), getFilteredPurchaseReport);
router.get('/sales/report/pdf', protect, authorize('admin', 'inventory_manager', 'inventory_managerr', 'sales', 'sales team'), getFilteredSalesReport);

module.exports = router;
