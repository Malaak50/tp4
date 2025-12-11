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
}
