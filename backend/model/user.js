const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    groups:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Group',
    }],
    expense: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
    }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;