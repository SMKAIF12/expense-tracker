const { mongo, default: mongoose } = require('mongoose');
const Expense = require('../models/Expense')
const addExpense = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(500).json({ success: false, message: `failed to add Expense` })
        }
        const idempotencyKey = req.headers['x-idempotency-key'];
        const existingExpense = await Expense.findOne({ idempotencyKey });
        if (existingExpense) {
            return res.status(200).json(existingExpense);
        }
        const newExpense = await Expense.create({ ...req.body, idempotencyKey: idempotencyKey, user:req.userInfo.userid });
        if (!newExpense) {
            return res.status(500).json({ success: false, message: `failed to add Expense` })
        }
        return res.status(201).json({ success: true, message: 'Expense added successfully', expense: newExpense })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}
const getExpenses = async (req, res) => {
    try {
        const { category, sort, search} = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const filter = {};
        const skip = (page - 1) * limit;
        filter.user = req.userInfo.userid;
        if (category) {
            filter.category = category;
        }
        if(search && search !== 'undefined') {
            filter.$or = [
                {description:{$regex:search, $options:'i'}},
                { category: { $regex: search, $options: 'i' } },
                { addedby: { $regex: search, $options: 'i' } }
            ]
        }
        const sortOptions = {};
        if (sort === 'date_desc') {
            sortOptions.date = -1;
            sortOptions.createdAt = -1;
        }
        else {
            sortOptions.date = 1;
        }
        const expenses = await Expense.find(filter).sort(sortOptions).limit(limit).skip(skip);
        const count = await Expense.countDocuments(filter);
        const totalPages = Math.ceil(count/limit);
        return res.json({ success: true, message: 'expenses found', expenses: expenses, totalPages:totalPages, expenseCount:count, currentPage:page })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}
const editExpenses = async (req, res) => {
    try {
        const idempotencyKey = req.headers['x-idempotency-key'];
        const existingExpense = await Expense.findOne({ idempotencyKey });
        if (existingExpense) {
            return res.status(200).json(existingExpense);
        }
        const expense = await Expense.findByIdAndUpdate(req.params.id, { ...req.body, idempotencyKey: idempotencyKey }, { returnDocument: 'after' });
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Unable to edit' })
        }
        return res.status(200).json({ success: true, message: 'expense Updated', updatedBook: expense });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Unable to delete' })
        }
        return res.status(200).json({ success: true, message: 'Expense Deleted', expense: expense })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}
const getTotalExpense = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = {
            user: new mongoose.Types.ObjectId(req.userInfo.userid)
        };

        if (category) {
            filter.category = category;
        }
        const totalExpense = await Expense.aggregate([
            {
                $match: filter
            },
            {
                $group: {
                    _id:"$category",
                    totalExpenses: { $sum: "$amount" }
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ]);
        const grandTotal = totalExpense.reduce((acc, curr) => acc + parseFloat(curr.totalExpenses), 0);
        res.status(200).json({ success: true, message: 'Data fetched', grandTotal: grandTotal, chartData:totalExpense });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occurred: ${error.message}` });
    }
}
module.exports = { addExpense, getExpenses, editExpenses, deleteExpense, getTotalExpense };