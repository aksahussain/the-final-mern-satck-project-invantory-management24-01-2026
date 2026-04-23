const Product = require('../models/Product');

const checkLowStock = async () => {
    // Find products where quantity <= minStockLevel
    const lowStockProducts = await Product.find({
        $expr: { $lte: ['$quantity', '$minStockLevel'] }
    });
    return lowStockProducts;
};

module.exports = { checkLowStock };
