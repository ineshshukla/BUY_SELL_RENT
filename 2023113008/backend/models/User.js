const mongoose = require('mongoose');
const { type } = require('os');
const {Schema} = mongoose;

const UserSchema = new Schema({
    name:String,
    email:{type:String, unique:true},
    password: String,
});

const UserModel =mongoose.model('User',UserSchema);

module.exports = UserModel;