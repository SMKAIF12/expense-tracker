import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
const AddExpense = ({ onExpenseAdded }) => {
    const [formData, setFormData] = useState({
        addedby: '', 
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
  
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

    const categories = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Others'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (parseFloat(formData.amount) <= 0) {
            setError("Amount must be a positive number.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://expense-tracker-three-neon.vercel.app/expense/add-expense', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Idempotency-Key': idempotencyKey
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save expense');

            setIdempotencyKey(uuidv4());
            setFormData({
                addedby: formData.addedby, 
                amount: '',               
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            if (onExpenseAdded) onExpenseAdded();
            setSuccess('Expense Addded Successfully!')
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm mb-4 border-0 bg-light">
            <div className="card-body">
                <h5 className="card-title text-primary mb-3">Add New Expense (INR)</h5>
                <form onSubmit={handleSubmit} className="row g-3">

                    <div className="col-md-3">
                        <label className="form-label fw-bold">Added By</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Your Name"
                            value={formData.addedby}
                            onChange={(e) => setFormData({ ...formData, addedby: e.target.value })}
                            required
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-bold">Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="form-control"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-bold">Category</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">Select...</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="col-md-2">
                        <label className="form-label fw-bold">Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-bold">Description</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="What was this for?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    {error && <div className="col-12 text-danger small">{error}</div>}
                    {success && <div className='col-12 text-success small'>{success}</div>}
                    <div className="col-12 text-end">
                        <button
                            type="submit"
                            className="btn btn-primary px-4"
                        >
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                            ) : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddExpense