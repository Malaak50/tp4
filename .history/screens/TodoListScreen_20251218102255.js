// screens/TodoListScreen.js
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { addTodo } from "../store/todosSlice";
import AppBar from "../components/AppBar";
import { useTodoStore } from "../store/useTodoStore"; 
const { todos, addTodo } = useTodoStore(); 
/*
export default function TodoListScreen({ navigation }) {
  const todos = useSelector(state => state.todos);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(addTodo({ id: 1, title: "Faire les courses" }));
    dispatch(addTodo({ id: 2, title: "Sortir le chien" }));
    dispatch(addTodo({ id: 3, title: "Coder une app RN" }));
  }, []);
*/
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <AppBar title="Mes tâches" />
      <FlatList
        data={todos}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Détails", item)}
          >
            <Text style={{ padding: 10, fontSize: 18 }}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}



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