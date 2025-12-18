/*import { NavigationContainer } from "@react-navigation/native";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import AppDrawer from "./navigation/AppDrawer";
import LoginScreen from "./screens/LoginScreen";
import { useContext } from "react";
function RootNavigator() {
const { user } = useContext(AuthContext);
return user ? <AppDrawer /> : <LoginScreen />;
}
export default function App() {
return (
 <AuthProvider>
 <NavigationContainer>
 <RootNavigator />
 </NavigationContainer>
 </AuthProvider>
);
}*/
 return state.filter((t) => t.id !== action.payload); 
   }, 
 }, 
}); 
 
export const { addTodo, removeTodo } = todosSlice.actions; 
export default todosSlice.reducer;