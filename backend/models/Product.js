const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 10 }, // For low stock alerts
    price: { type: Number, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    barcode: { type: String } // Base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
