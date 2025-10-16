import React, { useEffect, useState, useRef } from 'react';
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

import { NativeModules } from 'react-native';
console.log('Voice JS object:', Voice);
console.log('NativeModules.RNVoice:', NativeModules.RNVoice);
console.log('NativeModules.Voice:', NativeModules.Voice);

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
  const voiceInitialized = useRef(false);

  // Initialize Voice
  useEffect(() => {
    console.log('Initializing Voice module...');
    console.log('Voice module:', Voice);

    if (!Voice) {
      console.error('Voice module is null!');
      setError('Voice module failed to load');
      return;
    }

    // Set up event handlers
    Voice.onSpeechStart = (e) => {
      console.log('Started Speaking', e);
      setError('');
    };

    Voice.onSpeechEnd = (e) => {
      console.log('Stopped Speaking', e);
      setIsListening(false);
    };

    Voice.onSpeechResults = (e) => {
      console.log('Speech Results: ', e);
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
      }
    };

    Voice.onSpeechPartialResults = (e) => {
      console.log('Partial Speech Results: ', e);
      if (e.value && e.value[0]) {
        setTranscript(e.value[0]);
      }
    };

    Voice.onSpeechError = (e) => {
       console.log('onSpeechError full object:', JSON.stringify(e, null, 2));
      setError(e.error?.message || 'An error in detecting speech occurred');
      setIsListening(false);
    };

    voiceInitialized.current = true;
    console.log('Voice module initialized');

    return () => {
      if (voiceInitialized.current && Voice) {
        Voice.destroy().then(Voice.removeAllListeners).catch(console.error);
      }
    };
  }, []);

  // Start Listening for Speech
  const startListening = async () => {
      console.log('StartListening called');
    if (!Voice) {
      console.log('Voice module not available');
      setError('Voice module not available');
      return;
    }

    const hasPermission = await requestMicPermission();
    console.log('Mic permission:', hasPermission);

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
      await Voice.start('en-US');
      console.log('Voice recognition started');
    } catch (e) {
      console.error('There was an error in voice recognition: ', e);
      setError('Error starting voice recognition: ' + e.message);
      setIsListening(false);
    }
  };

  // Stop Listening for Speech
  const stopListening = async () => {
    if (!Voice) return;

    try {
      await Voice.stop();
      setIsListening(false);
      console.log('Voice recognition stopped');
    } catch (e) {
      console.error('There was an error stopping voice recognition:', e);
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

      <ScrollView style={styles.content}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Speech (Hindi)</Text>
          <View style={styles.textBox}>
            <Text style={styles.textContent}>
              {transcript || (isListening ? 'Listening...' : 'Tap the mic to start speaking...')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bot Reply</Text>
          <View style={styles.textBox}>
            <Text style={styles.textContent}>
              {reply || 'Waiting for response...'}
            </Text>
          </View>
        </View>
      </ScrollView>

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
          {isListening ? 'Listening... (Tap to stop)' : 'Tap to Speak'}
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
  errorBox: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default App;