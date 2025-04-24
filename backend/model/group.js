const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
  }],
  balances: {
    type: Map,
    of: Number, // Balance data (who owes whom, and how much)
  },
});

module.exports = mongoose.model('Group', groupSchema) // ✅ important