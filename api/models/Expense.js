const mongoose = require('mongoose');
const ExpenseSchema = new mongoose.Schema({
    addedby:{
        type:String,
        required:true
    },
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    category: {
        type: String,
        enum: ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Others'],
        default: 'Others',
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    idempotencyKey: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true })
module.exports = mongoose.model('expenses', ExpenseSchema)