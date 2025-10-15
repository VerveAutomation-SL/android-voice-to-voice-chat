import React, { useEffect, useState } from 'react';
import Voice from '@react-native-voice/voice';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';

// Request microphone permission
const requestMicPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Hindi Voice Bot needs access to your microphone',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [mqttStatus, setMqttStatus] = useState('Disconnected');
  const [error, setError] = useState("");

  //Voice Event Handlers
  useEffect(() => {
    Voice.onSpeechStart = (e) => {
      console.log('Started Speaking', e);
      setError('');
    };

    Voice.onSpeechEnd = (e) => {
      console.log('Stopped Speaking', e);
      setIsListening(false);
    };

    Voice.onSpeechError = (e) => {
      console.log('Error in detecting speaking', e);
      setError(e.error?.message || 'An error in detecting speech occured');
      setIsListening(false);
    }

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [])

  //Start Listeing for Speech
  const startListening = async () => {
    const hasPermission = await requestMicPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Microphone permission is required for voice recognition',
      );
      return;
    }

    try {
      setTranscript('');
      setError('');
      setIsListening(true);
      await Voice.start('hi-IN');
    } catch (e) {
      console.error('There was an erros in voice recognition: ', e);
      setError('There was an error in initiaiting voice recognition');
      setIsListening(false);
    }
  };

  //Stop Listening for Speech
  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('There was an error stopping voice recognition');
    }
  };

  // Handle Mic Button Press
const handleMicPress = async () => {
  if (isListening) {
    await stopListening();
  } else {
    await startListening();
  }
};

return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Hindi Voice Bot</Text>
      <View style={[
        styles.statusBadge,
        { backgroundColor: mqttStatus === 'Connected' ? '#00ff88' : '#ff4444' }
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
    shadowOffset: { width: 0, height: 4 },
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