import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import PrivateLayout from "./PrivateLayout";
import Login from "./Login";
import Register from "./Register";
import ExpenseTracker from "./ExpenseTracker";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/" element={<Login/>}/>
        <Route element={<PrivateLayout />}>
          <Route path="/addexpense" element={<ExpenseTracker />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
export default App