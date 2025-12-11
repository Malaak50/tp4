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
 <View style={{ flex: 1, padding: 20 }}>
 <Text style={{ fontSize: 24, marginBottom: 10 }}>Mes tâches</Text>
 <FlatList
 data={todos}
 keyExtractor={(i) => i.id.toString()}
 renderItem={({ item }) => (
 <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate("TodoDetails", { id: item.id, title: item.title })
            }
          >
            <Text style={styles.text}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  text: { fontSize: 18 },
});

