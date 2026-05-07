import React, { useState } from 'react'
import AddExpense from './AddExpense'
import ShowExpenses from './ShowExpenses';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';
const ExpenseTracker = () => {
    const [currentExpense,setCurrentExpense] = useState(null);
    const [editMode,setEditMode] = useState(false);
    const handleEdit = (expense)=>{
      setCurrentExpense(expense)
      setEditMode(true)
    }
  return (
    <div className='expense-app'>
        <Navbar/>
        <AddExpense />
        <ShowExpenses onEdit={handleEdit}/>
    </div>
  )
}

export default ExpenseTracker