import { View, Text, Button } from "react-native"; 
import { useDispatch } from "react-redux"; 
import { removeTodo } from "../store/todosSlice"; 
 
export default function TodoDetailsScreen({ route, navigation }) { 
 const { id, title } = route.params; 
 const dispatch = useDispatch(); 
 
 const handleDelete = () => { 
   dispatch(removeTodo(id)); 
   navigation.goBack(); 
 }; 
 
 return ( 
   <View style={{ flex: 1, padding: 20 }}> 
     <Text style={{ fontSize: 24 }}>{title}</Text> 
 
     <Button 
       title="Supprimer cette tâche" 
       color="red" 
       onPress={handleDelete} 
     /> 
   </View> 
 ); 
} 


/*import { View, Text, StyleSheet } from "react-native";

export default function TodoDetailsScreen({ route }) {
  const { id, title } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text>ID : {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});
*/