/*import { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AppBar from "../components/AppBar";

export default function TodoListScreen({ navigation }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTodos([
        { id: 1, title: "Faire les courses" },
        { id: 2, title: "Sortir le chien" },
        { id: 3, title: "Coder une app RN" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Text>Chargement...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Mes tâches" />
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate("Détails", { id: item.id, title: item.title })
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
*/