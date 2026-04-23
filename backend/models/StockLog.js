const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['IN', 'OUT', 'ADJUSTMENT'], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String }, // e.g., "Purchase Order #123", "Sales Order #456"
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
