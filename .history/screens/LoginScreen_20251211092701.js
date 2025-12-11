import { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
export default function LoginScreen() {
const [name, setName] = useState("");
const { login } = useContext(AuthContext);
return (
 <View style={styles.container}>
 <Text style={styles.title}>Connexion</Text>
 <TextInput
 style={styles.input}
 placeholder="Votre nom"