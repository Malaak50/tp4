import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DetailsScreen({ route }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📄 Écran de détails</Text>

      <Text style={styles.text}>
        ID reçu : {route.params ? route.params.id : 'Aucun ID'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  text: {
    marginTop: 10,
    fontSize: 18,
  },
});
