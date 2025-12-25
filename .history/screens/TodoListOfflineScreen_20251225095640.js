// /screens/TodoListOfflineScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  loadTodos,
  addTodoOffline,
  updateTodoOffline,
  toggleTodoCompletion,
  deleteTodoOffline,
  getTodoStats,
  saveTodosFromApi,
  loadUnsyncedTodos,
  markTodoAsSynced,
} from '../services/database';
import { fetchTodos, syncAllLocalTodos, checkConnection } from '../services/api';
import { ThemeContext } from '../context/ThemeContext';

export default function TodoListOfflineScreen() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    local: 0,
    pendingSync: 0,
  });

  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const refreshTodos = () => {
    const todosFromDB = loadTodos();
    setTodos(todosFromDB);
    setStats(getTodoStats());
  };

  const checkNetworkStatus = async () => {
    const online = await checkConnection();
    setIsOnline(online);
    return online;
  };

  const handleAddOrUpdate = () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre');
      return;
    }

    if (editingId) {
      updateTodoOffline(editingId, { title });
      setEditingId(null);
    } else {
      addTodoOffline(title);
    }

    setTitle('');
    refreshTodos();
  };

  const handleToggleComplete = (id) => {
    toggleTodoCompletion(id);
    refreshTodos();
  };

  const handleDelete = (id, title) => {
    Alert.alert(
      'Confirmer la suppression',
      `Supprimer "${title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteTodoOffline(id);
            refreshTodos();
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    setSyncing(true);
    
    try {
      const isOnline = await checkNetworkStatus();
      
      if (!isOnline) {
        Alert.alert('Hors ligne', 'Impossible de synchroniser sans connexion internet');
        return;
      }

      // 1. Charger les nouvelles tâches du serveur
      const apiTodos = await fetchTodos(15);
      saveTodosFromApi(apiTodos);

      // 2. Synchroniser les tâches locales
      const unsyncedTodos = loadUnsyncedTodos();
      
      if (unsyncedTodos.length > 0) {
        const syncResults = await syncAllLocalTodos(unsyncedTodos);
        
        // Mettre à jour les IDs locaux avec les IDs serveur
        syncResults.forEach(result => {
          if (result.success) {
            markTodoAsSynced(result.localId, result.serverTodo.id);
          }
        });

        const successfulSyncs = syncResults.filter(r => r.success).length;
        
        Alert.alert(
          'Synchronisation',
          `${successfulSyncs}/${unsyncedTodos.length} tâches synchronisées`
        );
      } else {
        Alert.alert('Synchronisation', 'Toutes les tâches sont à jour');
      }

      refreshTodos();
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleLoadFromAPI = async () => {
    setLoading(true);
    
    try {
      const isOnline = await checkNetworkStatus();
      
      if (!isOnline) {
        Alert.alert('Mode hors ligne', 'Affichage des données locales uniquement');
        return;
      }

      const apiTodos = await fetchTodos();
      saveTodosFromApi(apiTodos);
      refreshTodos();
      Alert.alert('Succès', 'Tâches chargées depuis le serveur');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTodos();
    checkNetworkStatus();
  }, []);

  const filteredTodos = showCompleted 
    ? todos 
    : todos.filter(todo => !todo.completed);

  const renderTodoItem = ({ item }) => (
    <View style={[
      styles.todoItem,
      isDark ? styles.darkTodoItem : styles.lightTodoItem,
      item.completed && styles.completedItem,
    ]}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => handleToggleComplete(item.id)}
      >
        <View style={styles.checkbox}>
          {item.completed ? (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color={isDark ? '#888' : '#666'} />
          )}
        </View>
        
        <View style={styles.todoTextContainer}>
          <Text style={[
            styles.todoTitle,
            isDark && styles.darkText,
            item.completed && styles.completedText,
          ]}>
            {item.title}
          </Text>
          
          <View style={styles.todoMeta}>
            <Text style={styles.todoMetaText}>
              {item.isLocal ? '📱 Local' : '🌐 Serveur'}
            </Text>
            {item.isLocal && !item.isSynced && (
              <Text style={styles.syncPendingText}>⏳ En attente</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.todoActions}>
        {item.isLocal && (
          <TouchableOpacity
            onPress={() => {
              setTitle(item.title);
              setEditingId(item.id);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color="#FFA000" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.title)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[
      styles.container,
      isDark ? styles.darkContainer : styles.lightContainer,
    ]}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDark && styles.darkText]}>
          📝 TodoList {isOnline ? '🌐' : '📴'}
        </Text>
        
        <View style={styles.headerActions}>
          <Button
            title={isDark ? '☀️ Light' : '🌙 Dark'}
            onPress={toggleTheme}
            color={isDark ? '#BB86FC' : '#6200EE'}
          />
        </View>
      </View>

      {/* Statistiques */}
      <View style={[
        styles.statsContainer,
        isDark ? styles.darkStats : styles.lightStats,
      ]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.total}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.local}
          </Text>
          <Text style={styles.statLabel}>Locales</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.pendingSync}
          </Text>
          <Text style={styles.statLabel}>À synchroniser</Text>
        </View>
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Nouvelle tâche..."
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={title}
            onChangeText={setTitle}
            style={[
              styles.input,
              isDark ? styles.darkInput : styles.lightInput,
              isDark && styles.darkText,
            ]}
            onSubmitEditing={handleAddOrUpdate}
          />
          
          <TouchableOpacity
            style={[
              styles.addButton,
              isDark ? styles.darkAddButton : styles.lightAddButton,
            ]}
            onPress={handleAddOrUpdate}
          >
            <Ionicons
              name={editingId ? "checkmark" : "add"}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {editingId && (
          <TouchableOpacity
            onPress={() => {
              setTitle('');
              setEditingId(null);
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        )}

        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={[styles.filterLabel, isDark && styles.darkText]}>
              Afficher les terminées
            </Text>
            <Switch
              value={showCompleted}
              onValueChange={setShowCompleted}
              trackColor={{ false: '#767577', true: isDark ? '#BB86FC' : '#6200EE' }}
              thumbColor={showCompleted ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title={loading ? "Chargement..." : "Charger depuis API"}
            onPress={handleLoadFromAPI}
            disabled={loading}
            color={isDark ? '#03DAC5' : '#03A9F4'}
          />
          
          <Button
            title={syncing ? "Synchronisation..." : "Synchroniser"}
            onPress={handleSync}
            disabled={syncing || !isOnline}
            color={isDark ? '#BB86FC' : '#6200EE'}
          />
        </View>
        
        {!isOnline && (
          <View style={styles.offlineWarning}>
            <Ionicons name="warning-outline" size={20} color="#FF9800" />
            <Text style={styles.offlineWarningText}>
              Mode hors ligne - Les modifications seront synchronisées plus tard
            </Text>
          </View>
        )}
      </View>

      {/* Liste des tâches */}
      <FlatList
        data={filteredTodos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTodoItem}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleLoadFromAPI}
            colors={isDark ? ['#BB86FC'] : ['#6200EE']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="checkmark-done-outline"
              size={64}
              color={isDark ? '#555' : '#CCC'}
            />
            <Text style={[styles.emptyText, isDark && styles.darkText]}>
              Aucune tâche pour le moment
            </Text>
            <Text style={[styles.emptySubtext, isDark && styles.darkSubtext]}>
              {showCompleted 
                ? 'Ajoutez votre première tâche' 
                : 'Toutes les tâches sont terminées'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#F5F5F5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  darkHeader: {
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubtext: {
    color: '#AAAAAA',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    margin: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lightStats: {
    backgroundColor: '#FFFFFF',
  },
  darkStats: {
    backgroundColor: '#1E1E1E',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  controls: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 8,
  },
  lightInput: {
    backgroundColor: '#FFFFFF',
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  darkInput: {
    backgroundColor: '#2D2D2D',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#444',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightAddButton: {
    backgroundColor: '#6200EE',
  },
  darkAddButton: {
    backgroundColor: '#BB86FC',
  },
  cancelButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 12,
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  offlineWarningText: {
    marginLeft: 8,
    color: '#FF9800',
    fontSize: 14,
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  lightTodoItem: {
    backgroundColor: '#FFFFFF',
  },
  darkTodoItem: {
    backgroundColor: '#1E1E1E',
  },
  completedItem: {
    opacity: 0.7,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  todoTextContainer: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoMeta: {
    flexDirection: 'row',
  },
  todoMetaText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  syncPendingText: {
    fontSize: 12,
    color: '#FF9800',
  },
  todoActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});