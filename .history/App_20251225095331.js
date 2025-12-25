// App.js
/*partie
import { useContext } from "react"; 
import { View, StyleSheet } from "react-native"; 
import { ThemeProvider, ThemeContext } from "./context/ThemeContext"; 
import TodoListFetchScreen from "./screens/TodoListFetchScreen"; 
 
function MainApp() { 
 const { theme } = useContext(ThemeContext); 
 
 return ( 
   <View 
     style={[ 
styles.container, 
       theme === "dark" ? styles.dark : styles.light, 
     ]} 
   > 
     <TodoListFetchScreen /> 
   </View> 
 ); 
} 
 
export default function App() { 
 return ( 
   <ThemeProvider> 
     <MainApp /> 
   </ThemeProvider> 
 ); 
} 
 
const styles = StyleSheet.create({ 
 container: { 
   flex: 1, 
   paddingTop: 40, 
 }, 
 light: { 
   backgroundColor: "#ffffff", 
 }, 
 dark: { 
   backgroundColor: "#121212", 
 }, 
});