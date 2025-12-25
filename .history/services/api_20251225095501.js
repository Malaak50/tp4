/*partie1
import axios from "axios"; 
 //const API_URL = "https://jsonplaceholder.typicode.com.data"; 

const API_URL = "https://jsonplaceholder.typicode.com"; 
 
// axios 
export const fetchTodosAxios = async () => { 
     // Délai artificiel de 8 secondes pour voir le loader
  await new Promise(resolve => setTimeout(resolve, 8000));
 const response = await axios.get(`${API_URL}/todos?_limit=10`); 
 return response.data; 
}; 
 
// fetch 
export const fetchTodosFetch = async () => { 
     // Délai artificiel de 8 secondes pour voir le loader
// Délai artificiel
  await new Promise(resolve => setTimeout(resolve, 8000)); const response = await fetch(`${API_URL}/todos?_limit=10`); 
 
 if (!response.ok) { 
   throw new Error("Erreur serveur"); 
 } 
 
 return response.json(); 
}; 
 */
// /services/api.js
import axios from 'axios';

const API_URL = 'https://jsonplaceholder.typicode.com';

// Configuration d'Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// Simuler une connexion réseau (pour le test)
const simulateNetwork = true;
const networkDelay = 1500;

// Fonction pour tester la connexion
export const checkConnection = async () => {
  try {
    if (simulateNetwork) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simuler une perte de connexion aléatoire
      const isOnline = Math.random() > 0.3; // 70% de chance d'être en ligne
      return isOnline;
    }
    return true;
  } catch {
    return false;
  }
};

// Récupérer les tâches avec gestion d'erreur
export const fetchTodos = async (limit = 20) => {
  if (simulateNetwork) {
    await new Promise(resolve => setTimeout(resolve, networkDelay));
  }
  
  try {
    const response = await api.get(`/todos?_limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur API:', error.message);
    throw new Error(`Impossible de charger les tâches: ${error.message}`);
  }
};

// Synchroniser une tâche locale avec le serveur (simulé)
export const syncTodoToServer = async (todo) => {
  if (simulateNetwork) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  try {
    // Simuler l'envoi au serveur
    const response = await api.post('/todos', todo);
    
    // Retourner l'ID du serveur (simulé)
    return {
      ...response.data,
      id: Math.floor(Math.random() * 1000) + 200, // ID simulé
    };
  } catch (error) {
    console.error('Erreur synchronisation:', error.message);
    throw new Error(`Échec synchronisation: ${error.message}`);
  }
};

// Synchroniser toutes les tâches locales
export const syncAllLocalTodos = async (localTodos) => {
  const results = [];
  
  for (const todo of localTodos) {
    try {
      const syncedTodo = await syncTodoToServer(todo);
      results.push({
        localId: todo.id,
        serverTodo: syncedTodo,
        success: true,
      });
    } catch (error) {
      results.push({
        localId: todo.id,
        error: error.message,
        success: false,
      });
    }
  }
  
  return results;
};