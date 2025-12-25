 
 const handleAddOrUpdate = () => { 
   if (!title.trim()) return; 
 
   if (editingId) { 
     // UPDATE OFFLINE 
     updateTodoOffline(editingId, title); 
     setEditingId(null); 
   } else { 
     // ADD OFFLINE 
     addTodoOffline(title); 
   } 
 
   setTitle(""); 
   refreshTodos(); 
 }; 
 
 useEffect(() => { 
   refreshTodos(); 
 }, []); 
 
 return ( 
   <> 
     {/* Theme toggle */} 
     <Button 
       title={`Passer en mode ${theme === "light" ? "dark" : "light"}`} 
       onPress={toggleTheme} 
     /> 
 
     {/* Add / Update */} 
     <View style={{ padding: 10 }}> 
       <TextInput 
         placeholder="Tâche offline" 
         value={title} 
         onChangeText={setTitle} 
         style={{ 
           borderWidth: 1, 
           padding: 10, 
           marginBottom: 10, 
         }} 
       /> 
 
       <Button 
         title={editingId ? "
✏
 Mettre à jour" : "
➕
 Ajouter hors ligne"} 
         onPress={handleAddOrUpdate} 
       /> 
     </View> 
 {todos.length === 0 ? ( 
       <Text style={{ textAlign: "center", marginTop: 20 }}> 
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
               padding: 10, 
             }} 
           > 
             <Text>{item.title}</Text> 
 
             <Button 
               title="
✏
" 
               onPress={() => { 
                 setTitle(item.title); 
                 setEditingId(item.id); 
               }} 
             /> 
           </View> 
         )} 
       /> 
     )} 
   </> 
 ); 
} 