import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AppBar from './components/AppBar';

import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- Navigation par pile ---
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,  // on cache le header du stack
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

// --- Navigation par onglets ---
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* App Bar personnalisée */}
        <AppBar />

        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: '#007AFF',
              tabBarStyle: { paddingBottom: 5, height: 60 },

              tabBarIcon: ({ focused, size }) => {
                let iconName;

                if (route.name === 'Maison') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Paramètres') {
                  iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} />;
              },
            })}
          >
            <Tab.Screen name="Maison" component={HomeStack} />
            <Tab.Screen name="Paramètres" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
