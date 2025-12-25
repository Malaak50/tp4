// App.js
import { useContext } from "react"; 
import { View, StyleSheet } from "react-native"; 
import { ThemeProvider, ThemeContext } from "./context/ThemeContext"; 
import TodoListFetchScreen from "./screens/TodoListFetchScreen"; 
 
function MainApp() { 
 const { theme } = useContext(ThemeContext); 
 
 return ( 
   <View 
     style={[ 
