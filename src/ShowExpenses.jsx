import React from 'react';
import { useState, useCallback, useEffect } from 'react';

const ShowExpenses = ({ refreshTrigger }) => {
    const [expenses, setExpenses] = useState({ expenses: [] }); // Initialize to match your API structure
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('date_desc');
    const [loading, setLoading] = useState(false);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            // Requirement: Support optional query parameters for category and sort
            const url = `http://localhost:3000/expense/expenses?category=${category}&sort=${sort}`;
            const response = await fetch(url);
            const data = await response.json();
            
            // Safety check: ensure we store the data in the expected format
            setExpenses(data || { expenses: [] });
        } catch (err) {
            console.error("Failed to fetch expenses", err);
            setExpenses({ expenses: [] });
        } finally {
            setLoading(false);
        }
    }, [category, sort]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses, refreshTrigger]);

    // Logic to see a simple total of expenses for the current list 
    const calculateTotal = () => {
        const list = expenses.expenses;
        
        if (list && Array.isArray(list) && list.length > 0) {
            const total = list.reduce((sum, item) => {
                // 1. Extract the raw value from the Decimal128 object
                const rawValue = item.amount?.$numberDecimal !== undefined
                    ? item.amount.$numberDecimal
                    : item.amount;

                // 2. Force conversion to a float and handle potential NaNs
                const parsedValue = parseFloat(rawValue);
                const safeValue = isNaN(parsedValue) ? 0 : parsedValue;

                return sum + safeValue;
            }, 0);

            // 3. Return the formatted INR string
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(total);
        }
        
        return "₹0.00";
    };

    return (
        <div className="container mt-4">
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <h1 className="mt-2 text-muted">Fetching Records...</h1>
                </div>
            ) : (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="text-secondary fw-bold">Expense Dashboard</h4>

                        <div className="d-flex gap-2">
                            {/* Requirement: Filter by category */}
                            <select
                                className="form-select form-select-sm"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Other'].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            {/* Requirement: Sort by date */}
                            <select
                                className="form-select form-select-sm"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="date_desc">Newest First</option>
                                <option value="date_asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    {/* Total: Summarized View */}
                    <div className="alert alert-primary d-flex justify-content-between align-items-center shadow-sm border-0">
                        <span className="fw-bold fs-5 text-uppercase">Total Expenditure</span>
                        <span className="h3 mb-0 text-dark">{calculateTotal()}</span>
                    </div>

                    {/* Requirement: List view of expenses */}
                    <div className="table-responsive shadow-sm rounded">
                        <table className="table table-hover bg-white mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Added By</th>
                                    <th className="text-end">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!expenses.expenses || expenses.expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No records found for this criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.expenses.map((exp) => (
                                        <tr key={exp._id}>
                                            <td className="text-muted">
                                                {new Date(exp.date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="fw-medium">{exp.description || 'No Description'}</td>
                                            <td>
                                                <span className="badge rounded-pill bg-light text-dark border">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="small text-muted">
                                                    {exp.addedBy || exp.addedby || 'Anonymous'}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold text-primary">
                                                ₹{parseFloat(exp.amount?.$numberDecimal || exp.amount || 0)
                                                    .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShowExpenses;