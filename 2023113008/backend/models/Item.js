const mongoose = require('mongoose');
const { Schema } = mongoose;

const ItemSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    category: { type: String, enum: ['clothing', 'grocery', 'electronics', 'other'] }, // Enum for categories
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model (Seller)
    status: { type: String, enum: ['available', 'sold'], default: 'available' } // Status field
});

const ItemModel = mongoose.model('Item', ItemSchema);

module.exports = ItemModel;
