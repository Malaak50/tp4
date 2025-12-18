import { View, Text, Button } from "react-native";
import { useTodoStore } from "../store/useTodoStore"; 

export default function TodoDetailsScreen({ route, navigation }) {
  const { id, title } = route.params;

  const removeTodo = useTodoStore((state) => state.removeTodo);

  const handleDelete = () => {
    removeTodo(id);        // supprime la tâche dans le store Zustand
    navigation.goBack();   // ✅ Étape 3 : revenir à l’écran précédent
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
/*import { View, Text, Button } from "react-native"; 
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
} */