import { configureStore } from "@reduxjs/toolkit";
import  expenseSlice  from "./slice/expense";
const store = configureStore({
    reducer: {
        expenseInfo:expenseSlice
    }
})
export default store;