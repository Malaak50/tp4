import { View, Text, FlatList, Button, TextInput } from "react-native"; 
import { useEffect, useState, useContext } from "react"; 
import { 
 loadTodos, 
 addTodoOffline, 
 updateTodoOffline, 
} from "../services/database"; 
import { ThemeContext } from "../context/ThemeContext"; 
 
export default function TodoListOfflineScreen() { 
 const [todos, setTodos] = useState([]); 
 const [title, setTitle] = useState(""); 
 const [editingId, setEditingId] = useState(null); 
 
 const { theme, toggleTheme } = useContext(ThemeContext); 
 
 const refreshTodos = () => { 
   setTodos(loadTodos()); 
 };