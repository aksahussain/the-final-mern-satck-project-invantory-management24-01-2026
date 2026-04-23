const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), getSuppliers)
    .post(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), createSupplier);

router.route('/:id')
    .put(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), updateSupplier)
    .delete(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), deleteSupplier);

module.exports = router;
