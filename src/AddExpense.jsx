import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import ShowExpenses from './ShowExpenses';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { clearExpense } from './slice/expense';
import { useMutation, useQueryClient } from '@tanstack/react-query';
const AddExpense = () => {
    const [formData, setFormData] = useState({
        addedby: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const expenseRef = useRef(null);
    const dispatch = useDispatch();
    const token = localStorage.getItem('authorization');
    const {expense:currentExpense, editMode} = useSelector((state)=>state.expenseInfo);
    useEffect(() => {
        const token = localStorage.getItem('authorization');
        const user = jwtDecode(token);
        setFormData({
            ...formData,
            addedby: user.username
        })
    }, [])
    useEffect(() => {
        if (currentExpense && editMode) {
            setFormData({
                addedby: currentExpense.addedby,
                amount: parseFloat(currentExpense.amount?.$numberDecimal || currentExpense.amount || 0),
                category: currentExpense.category,
                date: currentExpense.date ? currentExpense.date.split('T')[0] : '',
                description: currentExpense.description
            });
            expenseRef.current?.scrollIntoView({behavior:'smooth'});
        }
    }, [currentExpense, editMode])

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
    const categories = ['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Others'];
    const queryClient = useQueryClient();
    const URL = 'https://expense-tracker-bice-rho.vercel.app/expense';

    const clearFields = async () => {
        setFormData({
            addedby: '',
            amount: '',
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        dispatch(clearExpense())
    }
    // create mutation for adding a record.
    const addMutation = useMutation({
        mutationFn: async()=>{
            return await axios.post(`${URL}/add`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-idempotency-Key': idempotencyKey
            }
        });
        },
        onSuccess:()=>{
            setLoading(false);
            setSuccess('Expense Addded Successfully!');
            setIdempotencyKey(uuidv4())
            queryClient.invalidateQueries({queryKey:['expense']})
        },
        onError:(error)=>{
            setError(error.message);
        }
    })
    // create mutation for editing a record.
    const editMutation = useMutation({
        mutationFn: async () => {
            return await axios.put(`${URL}/edit/${currentExpense._id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'x-idempotency-Key': idempotencyKey
                }
            })
        },
        onSuccess: () => {
            setLoading(false);
            setSuccess('Expense Updated Successfully!');
            setIdempotencyKey(uuidv4())
            queryClient.invalidateQueries({ queryKey: ['expense'] });
        },
        onError: (error) => {
            setError(error.message)
        }
    })
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (parseFloat(formData.amount) <= 0) {
            setError("Enter a Valid Amount");
            setLoading(false);
            return;
        }
        if(editMode) {
          await editMutation.mutate();
        } else{
           await addMutation.mutate();
        }
        setFormData({
            addedby: formData.addedby,
            amount: '',
            category: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        dispatch(clearExpense());
    }
    return (
        <>
            <div className="add-expense">
                <div className="card-body">
                    <h5 className="card-title text-primary mb-3">Add New Expense (INR)</h5>
                    <form onSubmit={(e)=>{handleSave(e)}} className="row g-3" ref={expenseRef}>

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
                                className="btn px-4"
                            >
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                                ) : editMode ? 'Update' : 'Save Expense'}
                            </button>
                            <button onClick={clearFields} className='btn px-4 ms-1'>Clear</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default AddExpense