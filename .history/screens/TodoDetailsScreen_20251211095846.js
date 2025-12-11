import { View, Text } from "react-native";
export default function TodoDetailsScreen({ route }) {
const { id, title } = route.params;
return (
 <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
 <Text style={{ fontSize: 30 }}>{title}</Text>
 <Text style={{ fontSize: 20, marginTop: 10 }}>ID : {id}</Text>
 </View>
);
}