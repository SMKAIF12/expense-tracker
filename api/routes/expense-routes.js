const express = require('express');
const router = express.Router();
const { addExpense, getExpenses, editExpenses, deleteExpense,getTotalExpense } = require('../controllers/expense-controller');
const authMiddleWare = require('../middleware/auth-middleware')
router.post('/add', authMiddleWare, addExpense);
router.get('/get', authMiddleWare, getExpenses);
router.put('/edit/:id', authMiddleWare, editExpenses);
router.delete('/delete/:id', authMiddleWare, deleteExpense);
router.get('/total', authMiddleWare, getTotalExpense);
module.exports = router;