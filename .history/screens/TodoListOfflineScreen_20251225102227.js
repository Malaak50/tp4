import { View, Text, FlatList, Button, TextInput, TouchableOpacity } from "react-native";
import { useEffect, useState, useContext } from "react";
import {
  loadTodos,
  addTodoOffline,
  updateTodoOffline,
  deleteTodoOffline,
} from "../services/database";
import { ThemeContext } from "../context/ThemeContext";

export default function TodoListOfflineScreen() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const refreshTodos = () => {
    setTodos(loadTodos());
  };

  const handleAddOrUpdate = () => {
    if (!title.trim()) return;

    if (editingId) {
      updateTodoOffline(editingId, title);
      setEditingId(null);
    } else {
      addTodoOffline(title);
    }

    setTitle("");
    refreshTodos();
  };

  const handleDelete = (id) => {
    deleteTodoOffline(id);
    refreshTodos();
  };

  useEffect(() => {
    refreshTodos();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Button title="Changer le thème" onPress={toggleTheme} />

      <TextInput
        placeholder="Nouvelle tâche"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 10,
          marginVertical: 10,
          color: theme === "dark" ? "#fff" : "#000",
        }}
      />

      <Button
        title={editingId ? "Modifier" : "Ajouter"}
        onPress={handleAddOrUpdate}
      />

      {todos.length === 0 ? (
        <Text style={{ marginTop: 20 }}>
          Aucune tâche disponible hors ligne
        </Text>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: 1,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setTitle(item.title);
                  setEditingId(item.id);
                }}
              >
                <Text>{item.title}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: "red", fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
