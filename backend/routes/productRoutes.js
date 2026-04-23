const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, getProducts)
    .post(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), createProduct);

router.route('/:id')
    .get(protect, getProductById)
    .put(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), updateProduct)
    .delete(protect, authorize('admin', 'inventory_manager', 'inventory_managerr'), deleteProduct);

module.exports = router;
