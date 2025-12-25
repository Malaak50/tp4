 
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