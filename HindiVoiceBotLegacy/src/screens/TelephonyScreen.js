import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function TelephonyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Telephony Mode</Text>
      <Text style={styles.subtitle}>Under Implementation...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#8b8b9a', fontSize: 16 },
});
