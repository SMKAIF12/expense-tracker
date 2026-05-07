import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    expense: null,
    editMode:false
}
const expenseSlice = createSlice({
    name: 'expense',
    initialState,
    reducers: {
        setExpense: (state, action) => {
            state.expense = action.payload,
            state.editMode = true
        },
        clearExpense:(state,action)=>{
            state.expense = null,
            state.editMode = false
        }
    }
})
export const { setExpense,clearExpense } = expenseSlice.actions;
export default expenseSlice.reducer;