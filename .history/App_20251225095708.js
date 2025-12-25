// App.js
/*partie 1
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
});*/
// App.js
import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { initDB } from './services/database';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import TodoListOfflineScreen from './screens/TodoListOfflineScreen';
import * as Network from 'expo-network';

function MainApp() {
  const { theme } = useContext(ThemeContext);
  const [networkState, setNetworkState] = useState(null);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const network = await Network.getNetworkStateAsync();
        setNetworkState(network);
      } catch (error) {
        console.error('Erreur vérification réseau:', error);
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[
        styles.container,
        theme === 'dark' ? styles.dark : styles.light,
      ]}
    >
      <TodoListOfflineScreen />
      {networkState && !networkState.isConnected && (
        <View style={styles.networkBanner}>
          <View style={styles.networkContent}>
            <Text style={styles.networkText}>📶 Mode hors ligne</Text>
            <Text style={styles.networkSubtext}>
              Connexion limitée. Certaines fonctionnalités peuvent être indisponibles.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const prepareDb = async () => {
      try {
        await initDB();
        setDbReady(true);
      } catch (error) {
        console.error('Erreur initialisation DB:', error);
        setInitError(error.message);
        Alert.alert(
          'Erreur de base de données',
          'Impossible d\'initialiser le stockage local. L\'application fonctionnera en mode limité.',
          [{ text: 'OK', onPress: () => setDbReady(true) }]
        );
      }
    };

    prepareDb();
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Initialisation...</Text>
        {initError && (
          <Text style={styles.errorText}>{initError}</Text>
        )}
      </View>
    );
  }

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
    backgroundColor: '#F5F5F5',
  },
  dark: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  networkBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF9800',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F57C00',
  },
  networkContent: {
    alignItems: 'center',
  },
  networkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  networkSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
});