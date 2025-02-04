const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        item: { type: Schema.Types.ObjectId, ref: 'Item' },
        seller: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        otp: { type: String, required: true }
    }],
    total: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
