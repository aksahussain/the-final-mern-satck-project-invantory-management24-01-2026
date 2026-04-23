const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isBotResponse: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
