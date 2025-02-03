const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    transactionId: { type: String, required: true, unique: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to Buyer
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to Seller
    amount: { type: Number, required: true, min: 0 },
    hashedOtp: { type: String, required: true } // Store hashed OTP for security
});

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
