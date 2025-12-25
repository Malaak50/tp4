import axios from "axios"; 
 
const API_URL = "https://jsonplaceholder.typicode.com"; 
 
// axios 
export const fetchTodosAxios = async () => { 
 const response = await axios.get(`${API_URL}/todos?_limit=10`); 
 return response.data; 
}; 
 
// fetch 
export const fetchTodosFetch = async () => { 
     // Délai artificiel de  secondes pour voir le loader
  await new Promise(resolve => setTimeout(resolve, 4000));
 const response = await fetch(`${API_URL}/todos?_limit=10`); 
 
 if (!response.ok) { 
   throw new Error("Erreur serveur"); 
 } 
 
 return response.json(); 
}; 
 