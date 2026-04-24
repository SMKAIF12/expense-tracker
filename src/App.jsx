import { useState } from "react";
import AddExpense from "./AddExpense";
import ShowExpenses from "./ShowExpenses";
const App = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // This function is passed to AddExpense
  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Expense Tracker</h1>
      
      {/* 1. Pass the function to the Form */}
      <AddExpense onExpenseAdded={handleExpenseAdded} />
      
      <hr className="my-5" />

      {/* 2. Pass the trigger to the List */}
      <ShowExpenses refreshTrigger={refreshTrigger} />
    </div>
  );
};
export default App