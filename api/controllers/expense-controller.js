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
        const newExpense = await Expense.create({ ...req.body, idempotencyKey: idempotencyKey });
        if (!newExpense) {
            return res.status(500).json({ success: false, message: `failed to add Expense` })
        }
        return res.status(201).json({ success: true, message: 'Expense added successfully', expense: newExpense })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}
// const getAllExpenses = async (req, res) => {
//     try {
//         const fetchedExpenses = await Expense.find({});
//         if (!expenses || expenses.length === 0) {
//             return res.status(404).json({ success: false, message: 'No Records found' })
//         }
//         return res.status(200).json({ success: true, message: 'Expenses found', expenses: fetchedExpenses })
//     } catch (error) {
//         res.status(500).json({ success: false, message: `Error occured: ${error}` })
//     }
// }
const getExpenses = async (req, res) => {
    try {
        const { category, sort } = req.query;
        const filter = {};
        if (category) {
            filter.category = category;
        }
        const sortOptions = {};
        if (sort === 'date_desc') {
            sortOptions.date = -1;
        }
        else {
            sortOptions.date = 1;
        }
        const expenses = await Expense.find(filter).sort(sortOptions);
        return res.json({ success: true, message: 'expenses found', expenses: expenses })
    } catch (error) {
        res.status(500).json({ success: false, message: `Error occured: ${error}` })
    }
}
module.exports = { addExpense, getExpenses };