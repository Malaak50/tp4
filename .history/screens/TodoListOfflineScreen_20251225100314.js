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
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
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

const { width } = Dimensions.get('window');

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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const refreshTodos = () => {
    const todosFromDB = loadTodos();
    setTodos(todosFromDB);
    setStats(getTodoStats());
  };

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const confirmDelete = (id, title) => {
    setTodoToDelete({ id, title });
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    if (todoToDelete) {
      deleteTodoOffline(todoToDelete.id);
      refreshTodos();
      
      // Animation de suppression
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
      Alert.alert(
        'Supprimé',
        `"${todoToDelete.title}" a été supprimé`,
        [{ text: 'OK' }]
      );
      
      setTodoToDelete(null);
    }
    setDeleteModalVisible(false);
  };

  const handleDeleteMultiple = () => {
    const completedTodos = todos.filter(todo => todo.completed);
    
    if (completedTodos.length === 0) {
      Alert.alert('Aucune tâche', 'Aucune tâche terminée à supprimer');
      return;
    }
    
    Alert.alert(
      'Suppression multiple',
      `Supprimer ${completedTodos.length} tâche(s) terminée(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            completedTodos.forEach(todo => {
              deleteTodoOffline(todo.id);
            });
            refreshTodos();
            Alert.alert('Succès', `${completedTodos.length} tâche(s) supprimée(s)`);
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

      const apiTodos = await fetchTodos(15);
      saveTodosFromApi(apiTodos);
      const unsyncedTodos = loadUnsyncedTodos();
      
      if (unsyncedTodos.length > 0) {
        const syncResults = await syncAllLocalTodos(unsyncedTodos);
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

  // Composant pour les actions de glissement
  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={() => {
            setTitle(item.title);
            setEditingId(item.id);
          }}
        >
          <Animated.View
            style={{
              transform: [{ translateX: trans }],
            }}
          >
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Modifier</Text>
          </Animated.View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => confirmDelete(item.id, item.title)}
        >
          <Animated.View
            style={{
              transform: [{ translateX: trans }],
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            <Text style={styles.swipeActionText}>Supprimer</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTodoItem = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      friction={2}
      rightThreshold={40}
    >
      <Animated.View style={[
        styles.todoItem,
        isDark ? styles.darkTodoItem : styles.lightTodoItem,
        item.completed && styles.completedItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}>
        <TouchableOpacity
          style={styles.todoContent}
          onPress={() => handleToggleComplete(item.id)}
          onLongPress={() => confirmDelete(item.id, item.title)}
          delayLongPress={500}
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
          <TouchableOpacity
            onPress={() => {
              setTitle(item.title);
              setEditingId(item.id);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color="#FFA000" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => confirmDelete(item.id, item.title)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Swipeable>
  );

  return (
    <Animated.View style={[
      styles.container,
      isDark ? styles.darkContainer : styles.lightContainer,
      { opacity: fadeAnim },
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
        <TouchableOpacity 
          style={styles.statItem}
          onPress={refreshTodos}
        >
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.total}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Text style={[styles.statValue, isDark && styles.darkText]}>
            {stats.completed}
          </Text>
          <Text style={styles.statLabel}>Terminées</Text>
        </TouchableOpacity>
        
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
            <Text style={styles.cancelButtonText}>Annuler l'édition</Text>
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
            title={loading ? "Chargement..." : "Charger API"}
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
          
          <TouchableOpacity
            style={[
              styles.deleteAllButton,
              isDark ? styles.darkDeleteAllButton : styles.lightDeleteAllButton,
            ]}
            onPress={handleDeleteMultiple}
            disabled={stats.completed === 0}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.deleteAllButtonText}>
              Supprimer terminées
            </Text>
          </TouchableOpacity>
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
        ListFooterComponent={
          todos.length > 0 ? (
            <TouchableOpacity
              style={styles.clearAllContainer}
              onPress={() => {
                Alert.alert(
                  'Tout supprimer',
                  'Supprimer toutes les tâches ? Cette action est irréversible.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Tout supprimer',
                      style: 'destructive',
                      onPress: () => {
                        todos.forEach(todo => deleteTodoOffline(todo.id));
                        refreshTodos();
                        Alert.alert('Succès', 'Toutes les tâches ont été supprimées');
                      },
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-bin-outline" size={20} color="#F44336" />
              <Text style={styles.clearAllText}>Tout supprimer</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Modal de confirmation de suppression */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            isDark ? styles.darkModal : styles.lightModal,
          ]}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={48} color="#F44336" />
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                Confirmer la suppression
              </Text>
            </View>
            
            <View style={styles.modalContent}>
              {todoToDelete && (
                <>
                  <Text style={[styles.modalText, isDark && styles.darkText]}>
                    Voulez-vous vraiment supprimer cette tâche ?
                  </Text>
                  <View style={styles.todoPreview}>
                    <Text style={[styles.todoPreviewText, isDark && styles.darkText]}>
                      "{todoToDelete.title}"
                    </Text>
                  </View>
                  <Text style={[styles.modalSubtext, isDark && styles.darkSubtext]}>
                    Cette action est irréversible
                  </Text>
                </>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.confirmModalButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
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
    padding: 8,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  lightDeleteAllButton: {
    backgroundColor: '#F44336',
  },
  darkDeleteAllButton: {
    backgroundColor: '#CF6679',
  },
  deleteAllButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
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
  swipeActions: {
    flexDirection: 'row',
    width: 160,
    marginVertical: 6,
    marginRight: 12,
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  editAction: {
    backgroundColor: '#FFA000',
    marginRight: 4,
  },
  deleteAction: {
    backgroundColor: '#F44336',
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
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
  clearAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  clearAllText: {
    color: '#F44336',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.85,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  lightModal: {
    backgroundColor: '#FFFFFF',
  },
  darkModal: {
    backgroundColor: '#1E1E1E',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  modalContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  todoPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
    width: '100%',
  },
  todoPreviewText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelModalButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 8,
  },
  cancelModalButtonText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmModalButton: {
    backgroundColor: '#F44336',
    marginLeft: 8,
  },
  confirmModalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});