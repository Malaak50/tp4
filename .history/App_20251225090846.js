// App.js
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./store/store";
<
import AppDrawer from "./navigation/AppDrawer"; 
import LoginScreen from "./screens/LoginScreen"; 
import AuthProvider, { AuthContext } from "./context/AuthContext"; 
import { useContext } from "react";

function RootNavigator() {
  const { user } = useContext(AuthContext);
  return user ? <AppDrawer /> : <LoginScreen />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </Provider>
  );
}


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
