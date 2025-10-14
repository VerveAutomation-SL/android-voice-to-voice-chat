import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [mqttStatus, setMqttStatus] = useState('Disconnected');

  const handleMicPress = () => {
    setIsListening(!isListening);
    // Voice recognition will be implemented later
    console.log('Mic pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hindi Voice Bot</Text>
        <View style={[
          styles.statusBadge,
          {backgroundColor: mqttStatus === 'Connected' ? '#00ff88' : '#ff4444'}
        ]}>
          <Text style={styles.statusText}>MQTT: {mqttStatus}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Transcript Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Speech (Hindi)</Text>
          <View style={styles.textBox}>
            <Text style={styles.textContent}>
              {transcript || 'Tap the mic to start speaking...'}
            </Text>
          </View>
        </View>

        {/* Reply Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bot Reply</Text>
          <View style={styles.textBox}>
            <Text style={styles.textContent}>
              {reply || 'Waiting for response...'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Mic Button */}
      <View style={styles.micContainer}>
        <TouchableOpacity
          style={[
            styles.micButton,
            isListening && styles.micButtonActive
          ]}
          onPress={handleMicPress}
          activeOpacity={0.7}>
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>
        <Text style={styles.micLabel}>
          {isListening ? 'Listening...' : 'Tap to Speak'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderBottomColor: '#0f3460',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00d4ff',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  textContent: {
    color: '#e0e0e0',
    fontSize: 16,
    lineHeight: 24,
  },
  micContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
    borderTopWidth: 2,
    borderTopColor: '#0f3460',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ff88',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#ff4444',
    shadowColor: '#ff4444',
  },
  micIcon: {
    fontSize: 36,
  },
  micLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#00d4ff',
    fontWeight: '600',
  },
});

export default App;