const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true, match: /@iiit\.ac\.in$/ }, // Enforcing IIIT email restriction
    age: { type: Number, min: 0 },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true }, // Ensure hashing before saving
    cartItems: [{ type: Schema.Types.ObjectId, ref: 'Item' }], // References Item model
    sellerReviews: [{ type: String }] // Array of reviews as text (could be enhanced with a Review model)
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
