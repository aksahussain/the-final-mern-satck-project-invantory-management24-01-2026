const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        sellingPrice: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending' // Sales now start as pending
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
