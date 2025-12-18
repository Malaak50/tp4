import { createSlice } from "@reduxjs/toolkit"; 
const todosSlice = createSlice({ 
name: "todos", 
initialState: [], 
reducers: { 
addTodo: (state, action) => { 
state.push(action.payload); 
}, 
removeTodo: (state, action) => { 