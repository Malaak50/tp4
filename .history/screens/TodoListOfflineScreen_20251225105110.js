import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
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

  // ➕ Ajouter
  const handleAdd = () => {
    if (!title.trim()) return;
    addTodoOffline(title);
    setTitle("");
    refreshTodos();
  };

  // ✏️ Modifier
  const handleUpdate = () => {
    if (!title.trim() || editingId === null) return;
    updateTodoOffline(editingId, title);
    setEditingId(null);
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
        placeholder="Entrer une tâche"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: "#999",
          padding: 10,
          marginVertical: 10,
          color: theme === "dark" ? "#fff" : "#000",
        }}
      />

      {/* Bouton principal */}
      {editingId ? (
        <Button title="Modifier la tâche" onPress={handleUpdate} />
      ) : (
        <Button title="Ajouter la tâche" onPress={handleAdd} />
      )}

      {todos.length === 0 ? (
        <Text style={{ marginTop: 20 }}>
          Aucune tâche disponible hors ligne
        </Text>
      ) : (
        <FlatList
          style={{ marginTop: 20 }}
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderColor: "#ccc",
              }}
            >
              {/* Texte tâche */}
              <Text style={{ fontSize: 16 }}>{item.title}</Text>

              {/* Icônes actions */}
              <View style={{ flexDirection: "row", gap: 15 }}>
                {/* ✏️ Modifier */}
                <TouchableOpacity
                  onPress={() => {
                    setTitle(item.title);
                    setEditingId(item.id);
                  }}
                >
                  <Text style={{ fontSize: 18, color: "#1e90ff" }}>✏️</Text>
                </TouchableOpacity>

                {/* 🗑️ Supprimer */}
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={{ fontSize: 18, color: "red" }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
