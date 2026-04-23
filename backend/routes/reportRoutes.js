const express = require('express');
const router = express.Router();
const { getDashboardStats, getChartData, downloadSalesReportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/chart', protect, getChartData);
router.get('/sales/pdf', protect, downloadSalesReportPDF);


module.exports = router;
