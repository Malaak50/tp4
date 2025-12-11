import { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity } from "react-native";
export default function TodoListScreen({ navigation }) {
const [todos, setTodos] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
 console.log("Chargement des tâches...");
 setTimeout(() => {
 setTodos([
 { id: 1, title: "Faire les courses" },
 { id: 2, title: "Sortir le chien" },
 { id: 3, title: "Coder une app RN" },
 ]);
 setLoading(false);
 }, 1000);
}, []); // [] => exécute une seule fois au montage
if (loading) {
 return (
 <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
 <Text style={{ fontSize: 20 }}>Chargement...</Text>
 </View>
 );
}
return (