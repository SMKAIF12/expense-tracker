import axios from 'axios';
import React, { useRef } from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { setExpense } from './slice/expense';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ConfirmDelete from './ConfirmDelete';
import Stats from './Stats';
import useDebounce from './useDebounce';
const ShowExpenses = ({ onEdit }) => {
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('date_desc');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [pagenumber, setPagenumber] = useState(1);
    const [totalPages, setTotalPages] = useState(``)
    const token = localStorage.getItem('authorization');
    const [limit, setLimit] = useState(6);
    const queryClient = useQueryClient();
    const [overallTotal, setOverallTotal] = useState('');
    const [chartData, setChartData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchQuery, 500);
    const [fetchedData, setFetchedData] = useState([]);
    const refElement = useRef(null);
    const getOverallTotal = async () => {
        try {
            const response = await axios.get(`https://expense-tracker-three-neon.vercel.app/expense/total?${category}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setChartData(response.data.chartData);
            const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(response.data.grandTotal);
            setOverallTotal(formattedAmount);
        } catch (error) {
            console.error('An Unexpected error occured: ', error);
        }
    }
    const fetch = (page) => {
        const url = `https://expense-tracker-three-neon.vercel.app/expense/get?category=${category}&sort=${sort}&limit=${limit}&page=${page}&search=${debouncedSearchTerm}`;
        return axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    };
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["expense", pagenumber, category, sort, debouncedSearchTerm, limit],
        queryFn: () => fetch(pagenumber),
        placeholderData: keepPreviousData,
    })
    const deleteMutation = useMutation({
        mutationFn: async (expense) => {
            return await axios.delete(`https://expense-tracker-three-neon.vercel.app/expense/delete/${expense._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expense'] });
        },
        onError: (error) => {
            console.log(error.message)
        }
    })
    const handleDelete = (expense) => {
        deleteMutation.mutate(expense);
    }
    useEffect(() => {
        if (data && data.data) {
            setFetchedData(data.data);
            setPagenumber(data.data.currentPage);
            setTotalPages(data.data.totalPages);
            getOverallTotal();
            // refElement.current?.scrollIntoView({behavior:'smooth'});
        }
    }, [data])
    if (isLoading) {
        return (<h3>Loading Data....</h3>)
    }
    if (isError) {
        return (<h3>{error.message}</h3>)
    }
    const handlePagination = (next, goto) => {
        if (next) {
            setPagenumber((current) => current + 1)
        }
        else if (!next) {
            setPagenumber((current) => current - 1)
        }
        else {
            setPagenumber(goto);
        }
    }
    const handlePageNumberChange = (e) => {
        const gotoPage = parseInt(e.target.value);
        if (gotoPage > totalPages) {
            setPagenumber(totalPages);
        }
        else {
            setPagenumber(gotoPage);
        }
    }
    const calculateTotal = () => {
        const list = data.data.expenses;
        if (list && Array.isArray(list) && list.length > 0) {
            const total = list.reduce((sum, item) => {
                const rawValue = item.amount?.$numberDecimal !== undefined
                    ? item.amount.$numberDecimal
                    : item.amount;
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
        <div className="container">
            <h4 className="text-secondary fw-bold">Expense Dashboard</h4>
            <Stats chartData={chartData} overallTotal={overallTotal} />
            <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                <div className="d-flex gap-3 align-items-center flex-grow-1 justify-content-end">
                    <div className="position-relative flex-grow-1" style={{ maxWidth: '200px' }}>
                        <input
                            type="text"
                            className="form-control pe-5 shadow-sm"
                            placeholder="Search..."
                            style={{ height: '38px', paddingRight: '2.5rem' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="position-absolute top-50 end-0 translate-middle-y me-2 d-flex align-items-center">
                            {searchQuery ? (
                                <button
                                    className="btn btn-link p-0 text-muted border-0"
                                    onClick={() => setSearchQuery('')}
                                    style={{ textDecoration: 'none' }}
                                    type="button"
                                >
                                    <i className="bi bi-x-lg"></i> {/* Bootstrap Icon for "X" */}
                                </button>
                            ) : (
                                <i className="bi bi-search text-muted"></i>
                            )}
                        </div>
                    </div>
                    <select
                        className="form-select form-select-sm border-secondary-subtle shadow-sm"
                        style={{ width: 'auto' }}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ width: 'auto', height: '38px' }} // Fixed height
                    >
                        <option value="">All Categories</option>
                        {['Food', 'Travel', 'Rent', 'Utilities', 'Entertainment', 'Other'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        className="form-select form-select-sm border-secondary-subtle"
                        style={{ width: 'auto' }}
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{ width: 'auto', height: '38px' }}
                    >
                        <option value="date_desc">Newest First</option>
                        <option value="date_asc">Oldest First</option>
                    </select>
                </div>
            </div>
            <div className='table-container'>
                <div className="table-responsive rounded">
                    <table className="table table-hover mb-0 expense-table" ref={refElement}>
                        <thead className="custom-thead">
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Added By</th>
                                <th className="text-end">Amount</th>
                                <th className="text-end">Edit / Delete</th>
                            </tr>
                        </thead>
                        <tbody >
                            {!data.data.expenses || data.data.expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted ">
                                        No records found for this criteria.
                                    </td>
                                </tr>
                            ) : (
                                data.data.expenses.map((exp) => (
                                    <tr key={exp._id} >
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
                                        <td className="text-end">
                                            <button className='btn' style={{ backgroundColor: 'rgba(128, 128, 128, 0.491)' }} onClick={() => { dispatch(setExpense(exp)) }}><i className="bi bi-pencil-square"></i></button>
                                            <ConfirmDelete isPending={false} onDelete={() => { handleDelete(exp) }} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='d-flex align-items-center justify-content-between page-num px-3 py-3'>
                <div className='d-flex rows'>
                    <label htmlFor="">Rows per page: </label>
                    <select
                        className="form-select form-select-sm border-secondary-subtle ms-2"
                        style={{ width: 'auto' }}
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        style={{ width: 'auto', height: '38px' }} // Fixed height
                    >
                        <option value="4">4</option>
                        <option value="6">6</option>
                        <option value="8">8</option>
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                    </select>
                </div>
                <div className='d-flex page-controller'>
                    <button className='btn btn-primary m-1 me-2 btn-sm' onClick={() => { handlePagination(false) }} disabled={pagenumber === 1}>Previous</button>
                    <input className="form-control-sm text-center" value={`${pagenumber}`} onMouseDown={(e) => { e.target.value = '' }} onBlur={(e) => { e.target.value = pagenumber }} onChange={(e) => { handlePageNumberChange(e) }} />
                    <p className=''>of {totalPages}</p>
                    <button className='btn btn-primary m-1 btn-sm' onClick={() => { handlePagination(true) }} disabled={pagenumber === totalPages}>Next</button>
                </div>
                <div className='entries'>
                    Total Entries : {data.data.expenseCount}
                </div>
            </div>
            <div className="alert alert-primary d-flex justify-content-between align-items-center border-0 total-div">
                <span className="fw-bold fs-5 text-uppercase">Overall Expenditure</span>
                <span className="h3 mb-0 text-dark">{overallTotal}</span>
            </div>
            {(category || debouncedSearchTerm) && <div className="alert alert-primary d-flex justify-content-between align-items-center total-div border-0">

                <span className="fw-bold fs-5 text-uppercase" hidden={!category}>Total Expenditure on {category}</span>
                <span className="fw-bold fs-5 text-uppercase" hidden={!debouncedSearchTerm}>Total Expenditure Search Results</span>
                <span className="h3 mb-0 text-dark">{calculateTotal()}</span>
            </div>}
        </div>
    );
};

export default ShowExpenses;