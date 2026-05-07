import React, { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';
const Navbar = () => {
  const token = localStorage.getItem('authorization');
  const user = jwtDecode(token);
  const [message, setMessage] = useState('')
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('authorization');
    navigate('/login');
  }
  const getGreetings = () => {
    const hours = new Date().getHours();
    hours < 12 ? setMessage('Good Morning') : hours < 18 ? setMessage('Good Afternoon') : setMessage('Good Evening');
  }
  useEffect(() => {
    getGreetings();
  }, [])
  const fetch = async () => {
    return await axios.get('https://expense-tracker-bice-rho.vercel.app/expense/get', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
  const handleExport = async (type) => {
    const data = await fetch();
    const overallTotal = data.data.expenses.reduce((total, current) => total + parseFloat(current.amount?.$numberDecimal || current.amount || 0), 0);
    if (type === 'excel') {
      const workSheetData = data.data.expenses.map(expense => ({
        Date: new Date(expense.date).toLocaleDateString('en-IN'),
        Description: expense.description || 'N/A',
        Category: expense.category,
        Added_By: expense.addedBy || expense.addedby || 'Anonymous',
        Amount: parseFloat(expense.amount?.$numberDecimal || expense.amount || 0)
      }));
      workSheetData.push({
        Date: '',
        Description: '',
        Category: '',
        Added_By: 'OVERALL TOTAL',
        Amount: overallTotal
      });

      const workSheet = XLSX.utils.json_to_sheet(workSheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, workSheet, 'Expenses');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(dataBlob, `Expenses_Report_${new Date().toISOString()}.xlsx`);
    }
    else if (type === 'pdf') {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Expense Dashboard Report", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
      const tableRows = data.data.expenses.map(exp => [
        new Date(exp.date).toLocaleDateString('en-IN'),
        exp.description || 'No Description',
        exp.category,
        exp.addedBy || exp.addedby || 'Anonymous',
        parseFloat(exp.amount?.$numberDecimal || exp.amount || 0)
      ]);
      tableRows.push([
        {
          content: 'Overall Total',
          colSpan: 4,
          styles: { halign: 'right', fontStyle: 'bold', fillColor: [248, 249, 250] }
        },
        {
          content: overallTotal,
          styles: { fontStyle: 'bold', fillColor: [248, 249, 250] }
        }
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Description', 'Category', 'Added By', 'Amount (INR)']],
        body: tableRows,
        // 1. Set global header styles
        headStyles: {
          fillColor: [207, 226, 255],
          textColor: [8, 66, 152],
          halign: 'left' // Default alignment for headers
        },
        // 2. Override alignment for specific header columns
        // This ensures the "Amount" text moves to the right
        columnStyles: {
          4: { halign: 'right' }
        },
        // 3. To explicitly force the header of column 4 to be right-aligned
        didParseCell: (hookData) => {
          // Handle the currency prefix for body rows
          if (hookData.section === 'body' && hookData.column.index === 4 && hookData.row.index < data.data.expenses.length) {
            hookData.cell.text = [`${hookData.cell.raw}`];
          }

          // Force header alignment if columnStyles didn't apply to the header automatically
          if (hookData.section === 'head' && hookData.column.index === 4) {
            hookData.cell.styles.halign = 'right';
          }
        }
      });
      const fileName = 'Expense_' + new Date().toISOString();
      doc.save(`${fileName}.pdf`);
    }
  }
  return (
    <div className=''>
      <div className='d-flex m-1'>
        {user && (<h4>{message}, <span className='text-primary'>{user.username}</span></h4>)}
        <select className="form-select export-menu" onChange={(e) => { handleExport(e.target.value); e.target.value= '' }}>
          <option value="">Export As</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
        <button onClick={handleLogout} className="btn px-4 ms-auto" style={{ backgroundColor: '#b23b3b', color: 'white' }}>
          <i className="bi bi-box-arrow-right"></i> Logout
        </button>
      </div>
    </div>
  )
}
export default Navbar;