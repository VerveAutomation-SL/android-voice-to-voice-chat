import React, { useEffect, useState, useRef } from 'react';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import { getGeminiResponse } from '../services/geminiService';
import { sendRobotCommand } from '../services/RobotMotionService';
import AsyncStorage from '@react-native-async-storage/async-storage'
import SettingsModal from '../components/SettingsModal';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Alert,
  Image,
  Animated,
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
          title: 'Microphone Permission Required',
          message: 'AIVOICY needs access to your microphone to process yourspeech commands',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Microphone Permissiob Denied',
          'Microphone permission is required for voice input. Please enable it in your app settings.',
        );
        return false;
      }
    } catch (err) {
      console.warn('Microphone Permission Error:', err);
      Alert.alert('Error', 'Unable to request microphone permission.');
      return false;
    }
  }
  return true;
};

//Check if Robot SDK is available
const checkRobotConnection = () => {
  try {
    const { MotionManager3399 } = NativeModules;
    if (MotionManager3399 && typeof MotionManager3399.moveFront === 'function') {
      console.log('Robot SDK is detected');
      return true;
    } else {
      console.log('Robot SDK is not detected, Switching to mock mode');
      return false;
    }
  } catch (error) {
    console.log('Error detecting Robot SDK:', error);
    return false;
  }
}

// Utility for structured logging
const logEvent = (type, message) => {
  const timestamp = new Date().toISOString().split('T').join(' ').split('Z')[0];
  console.log(`[${timestamp}] [${type}] ${message}`);
}

export default function AskMeScreen() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [mqttStatus, setMqttStatus] = useState('Disconnected');
  const [error, setError] = useState("");
  const voiceInitialized = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [languageMode, setLanguageMode] = useState('manual');
  const [languageReady, setLanguageReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const statusPulse = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for listening state
  useEffect(() => {
    let animation = null;

    pulseAnim.stopAnimation(() => {
      pulseAnim.setValue(1);

      if (isListening) {
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
        animation.start();
      }
    });

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isListening]);

  // Status indicator pulse animation
  useEffect(() => {
    let animation = null;

    statusPulse.stopAnimation(() => {
      statusPulse.setValue(1);

      if (mqttStatus === 'Connected') {
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(statusPulse, {
              toValue: 1.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(statusPulse, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        animation.start();
      }
    });

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [mqttStatus]);

  // Waveform animation
  useEffect(() => {
    let animations = [];

    waveAnims.forEach(anim => {
      anim.stopAnimation(() => {
        anim.setValue(0);
      });
    });

    if (isListening) {
      const timeout = setTimeout(() => {
        animations = waveAnims.map((anim, index) =>
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: 1,
                duration: 400 + index * 100,
                useNativeDriver: false,
              }),
              Animated.timing(anim, {
                toValue: 0,
                duration: 400 + index * 100,
                useNativeDriver: false,
              }),
            ])
          )
        );

        Animated.stagger(100, animations).start();
      }, 50);

      return () => {
        clearTimeout(timeout);
        animations.forEach(anim => anim.stop());
        waveAnims.forEach(anim => {
          anim.stopAnimation();
          anim.setValue(0);
        });
      };
    }

    return () => {
      waveAnims.forEach(anim => {
        anim.stopAnimation();
        anim.setValue(0);
      });
    };
  }, [isListening]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    logEvent('LANGUAGE', `User selected language: ${selectedLanguage}`);
    Tts.setDefaultLanguage(selectedLanguage).catch(e =>
      console.warn('TTS language change failed', e),
    );
  }, [selectedLanguage]);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('selectedLanguage');
        const savedMode = await AsyncStorage.getItem('languageMode');
        const langToUse = savedLang || 'hi-IN';
        const modeToUse = savedMode || 'manual';

        console.log('🔄 Restoring saved language:', langToUse, '| mode:', modeToUse);
        setSelectedLanguage(langToUse);
        setLanguageMode(modeToUse);

        await Tts.setDefaultLanguage(langToUse);
        setLanguageReady(true);
      } catch (error) {
        console.error('Error loading saved language:', error);
        setLanguageReady(true);
      }
    };

    loadLanguage();
  }, []);

  //Shimmer animation for loading state
  useEffect(() => {
    let animation = null;

    shimmerAnim.stopAnimation(() => {
      shimmerAnim.setValue(0);

      if (isLoading) {
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(shimmerAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        );
        animation.start();
      }
    });

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isLoading]);

  useEffect(() => {
    if (!languageReady) {
      console.log('⏳ Waiting for language to load before initializing...');
      return;
    }

    console.log('✅ Language ready. Initializing Voice & TTS...');
    console.log('Voice module:', Voice);

    if (!Voice) {
      console.error('Voice module is null!');
      setError('Voice module failed to load');
      return;
    }

    const initTts = async () => {
      try {
        await Tts.getInitStatus();
        await Tts.setDefaultLanguage(selectedLanguage);
        await Tts.setDefaultRate(0.55);
        await Tts.setDefaultPitch(0.95);
        Tts.addEventListener('tts-finish', () => {
          logEvent('TTS', 'Speech playback finished');
          setIsListening(false);
        });
      } catch (e) {
        console.error('❌ Failed to initialize TTS:', e);
        Alert.alert(
          'TTS Engine Error',
          'Text-to-Speech engine could not be initialized. Some responses may not be spoken aloud.'
        );
      }
    };
    initTts();

    Voice.onSpeechStart = () => {
      logEvent('VOICE', 'Speech recognition started');
      setError('');
    };

    Voice.onSpeechEnd = () => {
      logEvent('VOICE', 'Speech recognition ended');
      setIsListening(false);
    };

    Voice.onSpeechResults = async (e) => {
  logEvent('VOICE', `Speech results received: ${JSON.stringify(e.value)}`);

  if (!e.value || !e.value[0]) return;
  const spokenText = (e.value[0] || transcript || '').trim();
  setTranscript(spokenText);

  try {
    // 🚀 Non-blocking stop
    if (isListening) stopListening();

    setIsLoading(true);
    setReply('Verve AIVoicy is thinking...');

    // 🧠 Run robot + AI concurrently for speed
    const robotPromise = sendRobotCommand(spokenText);
    logEvent('ROBOT', `Executing robot command for text: "${spokenText}"`);

    // 🔍 Language detection logic (cache-aware)
    let activeLang = selectedLanguage;
    let detectedLang = activeLang;

    if (languageMode === 'auto') {
      const lastLangJSON = await AsyncStorage.getItem('selectedLanguage');
      const lastLang = lastLangJSON ? JSON.parse(lastLangJSON) : null;

      // ✅ Reuse language if used within 1 min
      if (lastLang && Date.now() - lastLang.timestamp < 60000) {
        detectedLang = lastLang.value;
        logEvent('LANGUAGE', `♻ Using cached detected language: ${detectedLang}`);
      } else {
        const detectPrompt = `
You are a multilingual text detector.
The user might have spoken in Sinhala, Tamil, Hindi, Malay, Chinese, or English.
The input may contain distorted English words (e.g., "Obama komakda" = Sinhala "ඔබගේ නම කුමක් ද?").
Return only JSON:
{"language": "si-LK", "correctedText": "ඔබගේ නම කුමක් ද?"}
User said: ${spokenText}`;

        const correctionResponse = await getGeminiResponse(detectPrompt, 'en-US');

        try {
          const parsed = JSON.parse(correctionResponse.match(/\{[\s\S]*\}/)?.[0]);
          if (parsed?.language && parsed?.correctedText) {
            detectedLang = parsed.language;
            setTranscript(parsed.correctedText);
            console.log('🌐 Verve AIVoicy auto-detected language:', parsed.language);
            console.log('📝 Corrected text:', parsed.correctedText);

            await AsyncStorage.setItem(
              'selectedLanguage',
              JSON.stringify({ value: detectedLang, timestamp: Date.now() })
            );
          }
        } catch (jsonErr) {
          console.warn('⚠️ Could not parse Gemini detection JSON; using regex fallback.');
          detectedLang = detectLanguageFromText(spokenText);
        }
      }

      activeLang = detectedLang;
      setSelectedLanguage(activeLang);
    }

    // 🧠 Step 2: Get AI reply
    const promptPrefixMap = {
      'hi-IN': 'Please reply ONLY in Hindi (Devanagari). Example: "कैसे हो?"',
      'ta-IN': 'Please reply ONLY in Tamil (Tamil script). Example: "வணக்கம், எப்படி இருக்கீங்க?"',
      'si-LK': 'Please reply ONLY in Sinhala (Sinhala script). Example: "ඔබට කොහොම ද?"',
      'ms-MY': 'Please reply ONLY in Malay. Example: "Apa khabar?"',
      'zh-CN': '请只用中文回答。例如："你好，你怎么样？"',
      'en-US': 'Reply ONLY in English:',
    };

    const promptPrefix = promptPrefixMap[activeLang] || promptPrefixMap['en-US'];
    const correctedText = transcript || spokenText;

    // 🚀 Parallelize both actions
    const [_, aiReply] = await Promise.all([
      robotPromise,
      getGeminiResponse(
        `${promptPrefix}\nUser said: ${correctedText}\nPlease answer naturally.`,
        activeLang
      ),
    ]);

    logEvent('AI', `Gemini replied: ${aiReply}`);
    setReply(aiReply);
    setIsLoading(false);

    // 🔊 Step 3: Speak result faster
    Tts.stop();
    await Tts.setDefaultLanguage(activeLang);
    logEvent('TTS', `Speaking AI reply in ${activeLang}`);
    Tts.speak(aiReply, { androidParams: { KEY_PARAM_STREAM: 'STREAM_MUSIC' } });
  } catch (err) {
    console.error('Gemini processing error:', err);
    const errMsg =
      selectedLanguage === 'ta-IN'
        ? 'சர்வர் இணைப்பில் சிக்கல் ஏற்பட்டது.'
        : 'सर्वर से कनेक्शन में समस्या हुई।';
    setReply(errMsg);
    Tts.speak(errMsg);
  }
};

    let partialBuffer = '';

Voice.onSpeechPartialResults = (e) => {
  if (e.value && e.value.length > 0) {
    const current = e.value[e.value.length - 1].trim();
    if (current && current !== partialBuffer) {
      partialBuffer = current;
      setTranscript(partialBuffer);
      console.log('🌀 Accumulating speech:', partialBuffer);
    }
  }
};

    Voice.onSpeechError = (e) => {
      console.log('onSpeechError full object:', JSON.stringify(e, null, 2));
      let errorMessage = 'An error occurred while detecting your speech.';
      if (e.error?.message) {
        errorMessage = e.error.message.toLowerCase().includes('no_match')
          ? 'I could not understand that. Please try again.'
          : e.error.message;
      }
      setError(errorMessage);
      Alert.alert('Speech Recognition Error', errorMessage);
      setIsListening(false);
    };

    voiceInitialized.current = true;
    console.log('Voice module initialized');

    return () => {
      if (voiceInitialized.current && Voice) {
        Voice.destroy().then(Voice.removeAllListeners).catch(console.error);
      }
    };
  }, [languageReady]);

  useEffect(() => {
    const connected = checkRobotConnection();
    setMqttStatus(connected ? 'Connected' : 'Disconnected - Mock Mode');
  }, []);

  // Start Listening for Speech
  const startListening = async () => {
    console.log('StartListening called');
    const currentLang =  languageMode === 'auto'
    ? selectedLanguage  
    : selectedLanguage;

    const hasPermission = await requestMicPermission();
    if (!hasPermission) return;

    try {
      setTranscript('');
      setError('');

      await Tts.setDefaultLanguage(currentLang);
      logEvent('LANGUAGE', `Confirmed active language: ${currentLang}`);

      setIsListening(true);

    // 🌐 Dynamic language start (for Auto Mode)
    if (languageMode === 'auto') {
      const lastLang = await AsyncStorage.getItem('selectedLanguage');
      if (lastLang) {
        console.log(`🌐 Using last detected language: ${lastLang}`);
        await Voice.start(lastLang);
      } else {
        console.log('🌍 Defaulting to English (en-US)');
        await Voice.start('en-US');
      }
    } else {
      await Voice.start(selectedLanguage);
    }


      logEvent('VOICE', `Voice recognition started in ${currentLang}`);
    } catch (e) {
      console.error('Error starting voice recognition: ', e);
      setError('Error starting voice recognition: ' + e.message);
      setIsListening(false);
    }

    logEvent(
      'VOICE',
      `🎙️ Listening in: ${currentLang} (${languageMode === 'auto' ? 'Auto' : 'Manual'} Mode)`
    );
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

  // Handle Sign In Button Press
  const handleSignIn = () => {
    Alert.alert('Sign In', 'Sign in functionality to be implemented');
  };

  const getStatusConfig = () => {
    if (isLoading) {
      return {
        text: 'Processing',
        subtext: 'AI is crafting a response...',
        color: '#a78bfa',
        bgColor: 'rgba(167,139,250,0.35)',
      };
    }
    if (isListening) {
      return {
        text: 'Listening',
        subtext: 'Speak naturally, I\'m all ears',
        color: '#6366f1',
        bgColor: 'rgba(99,102,241,0.4)',
      };
    }
    return {
      text: 'Ready',
      subtext: 'Tap the mic to start conversation',
      color: '#8b5cf6',
      bgColor: 'rgba(139,92,246,0.2)',
    };
  };

  const status = getStatusConfig();

  const detectLanguageFromText = (text = '') => {
    const lower = text.toLowerCase();

    // --- Tamil script or keywords ---
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
    if (/\b(vanakkam|enna|epdi|solra|ungal|paaru|seri|podu|pa|da|illai|ama)\b/.test(lower))
      return 'ta-IN';

    // --- Hindi script or keywords ---
    if (/[\u0900-\u097F]/.test(text)) return 'hi-IN';
    if (/\b(namaste|kaise|hai|nahi|karo|batao|tum|mera|aap|haan|nahin|karna|jao|banao)\b/.test(lower))
      return 'hi-IN';

    // --- Sinhala script or keywords ---
    if (/[\u0D80-\u0DFF]/.test(text)) return 'si-LK';
    if (/\b(koho|kohomada|kohomadha|kohomda|mage|hondai|karanna|nadda|hari|eka|kavada|suba|ayubowan|oya|thiyenawa|kumakda|komakda|obage)\b/.test(lower))
      return 'si-LK';
    // Handle common misheard English versions of Sinhala
    if (/\b(obama|coho|komakda|kumakda|kobama|kobam|obama komakda|coho mother|kohomother|kaho mother)\b/.test(lower))
      return 'si-LK';


    // --- Malay (Roman script only, common words) ---
    if (/\b(selamat|apa|khabar|baik|terima|kasih|makan|minum|nama|anda|saya|boleh)\b/.test(lower))
      return 'ms-MY';

    // --- Chinese script or pinyin (simplified) ---
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
    if (/\b(nihao|xiexie|zaijian|hao|zhongguo|pengyou|shuo|hen|de)\b/.test(lower))
      return 'zh-CN';

    // --- English script or keywords ---
    if (/\b(hello|hi|how|thanks|good|morning|evening|yes|no|please|okay)\b/.test(lower))
      return 'en-US';

    // --- Default fallback ---
    return 'en-US';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
            <View style={styles.logoGlow} />
          </View>
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>AIVOICY</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              activeOpacity={0.8}
            >
              <View style={styles.signInGradient}>
                <Text style={styles.signInText}>Sign In</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  mqttStatus === 'Connected'
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(250,204,21,0.15)',
                borderColor:
                  mqttStatus === 'Connected'
                    ? 'rgba(16,185,129,0.4)'
                    : 'rgba(250,204,21,0.4)',
              },
            ]}
          >
            <Animated.View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    mqttStatus === 'Connected' ? '#10b981' : '#facc15',
                  transform: [{ scale: statusPulse }],
                },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                {
                  color:
                    mqttStatus === 'Connected' ? '#10b981' : '#facc15',
                },
              ]}
            >
              {mqttStatus === 'Connected'
                ? 'Robot Connected'
                : 'Disconnected - Mock Mode'}
            </Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>⚠</Text>
            </View>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Error Occurred</Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          </View>
        ) : null}

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {error ? (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>⚠</Text>
              </View>
              <View style={styles.errorContent}>
                <Text style={styles.errorTitle}>Error Occurred</Text>
                <Text style={styles.errorMessage}>{error}</Text>
              </View>
            </View>
          ) : null}

          {/* 🌌 Center Glowing Orb */}
          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.glowOrb,
                {
                  transform: [
                    { scale: pulseAnim },
                    {
                      rotate: isLoading
                        ? shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        })
                        : '0deg',
                    },
                  ],
                  shadowColor: status.color,
                  shadowOpacity: isListening ? 1 : isLoading ? 0.8 : 0.5,
                  shadowRadius: isListening ? 35 : isLoading ? 25 : 15,
                  backgroundColor: status.bgColor,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.innerOrb,
                  {
                    backgroundColor: isLoading
                      ? 'rgba(167,139,250,0.8)'
                      : isListening
                        ? 'rgba(99,102,241,0.8)'
                        : 'rgba(60,60,90,0.6)',
                    shadowColor: status.color,
                    transform: [
                      {
                        scale: isListening
                          ? pulseAnim.interpolate({
                            inputRange: [1, 1.15],
                            outputRange: [1, 1.2],
                          })
                          : 1,
                      },
                    ],
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.7, 1],
                    }),
                  },
                ]}
              />
            </Animated.View>

            <Animated.Text
              style={[
                styles.centerStatusText,
                {
                  opacity: fadeAnim,
                  color: status.color,
                }
              ]}
            >
              {status.text}
            </Animated.Text>

            <Animated.Text
              style={[
                styles.centerSubtext,
                { opacity: fadeAnim }
              ]}
            >
              {status.subtext}
            </Animated.Text>

            {reply ? (
              <Animated.Text
                style={[
                  styles.centerReplyText,
                  {
                    opacity: fadeAnim,
                  }
                ]}
                numberOfLines={5}
              >
                {reply}
              </Animated.Text>
            ) : null}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Microphone Control */}
      <View style={styles.controlPanel}>
        <View style={styles.controlPanelGradient} />

        <View style={styles.microphoneSection}>
          {/* Mic Button + Language Text */}
          <Animated.View style={{ alignItems: 'center', transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={handleMicPress}
              activeOpacity={0.8}
            >
              <View style={styles.micButtonGlow} />
              <View style={styles.micButtonInner}>
                {isListening ? (
                  <View style={styles.stopIcon}>
                    <View style={styles.stopSquare} />
                  </View>
                ) : (
                  <Text style={styles.micIcon}>🎙️</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* This stays clearly below the mic */}
            <Text style={styles.languageText}>
              Mode:{' '}
              <Text style={{ color: '#8b5cf6', fontWeight: '700' }}>
                {languageMode === 'auto' ? 'Auto' : 'Manual'}
              </Text>{' '}
              • Language:{' '}
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>
                {selectedLanguage === 'hi-IN'
                  ? 'Hindi'
                  : selectedLanguage === 'ta-IN'
                    ? 'Tamil'
                    : selectedLanguage === 'en-US'
                      ? 'English'
                      : selectedLanguage}
              </Text>
            </Text>
          </Animated.View>

          {/* Speak Controls */}
          <Text style={styles.controlLabel}>
            {isListening ? 'Tap to Stop' : 'Tap to Speak'}
          </Text>
          <Text style={styles.controlSubtext}>
            {isListening ? 'Recording in progress' : 'Voice recognition ready'}
          </Text>
        </View>


        {/* Footer Attribution */}
        <Text style={styles.footerText}>Product of Verve Automation</Text>
      </View>
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onLanguageChange={(newLang, newMode) => {
          setSelectedLanguage(newLang);
          setLanguageMode(newMode);
          Tts.setDefaultLanguage(newLang);
          logEvent('LANGUAGE', `Updated via settings: ${newLang} (${newMode})`);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#12121a',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },



  logoContainer: {
    position: 'relative',
    marginRight: 12,
  },

  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f1f2e',
    borderWidth: 2,
    borderColor: '#6366f1',
  },

  logoGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    opacity: 0.2,
    top: 0,
    left: 0,
  },

  brandContainer: {
    justifyContent: 'center',
  },

  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },

  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },

  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  signInButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },

  signInGradient: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  signInText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    gap: 16,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(153, 27, 27, 0.5)',
  },

  errorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(153, 27, 27, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  errorIconText: {
    fontSize: 18,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fecaca',
    marginBottom: 4,
  },

  errorMessage: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },

  messageCard: {
    position: 'relative',
    backgroundColor: '#12121a',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f1f2e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },

  aiMessageCard: {
    borderColor: '#2a2a3e',
  },

  cardGradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#6366f1',
    opacity: 0.6,
  },

  cardGradientBorderAI: {
    backgroundColor: '#8b5cf6',
  },

  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f1f2e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2.5,
    borderColor: '#6366f1',
  },

  avatarAI: {
    borderColor: '#8b5cf6',
  },

  avatarGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    opacity: 0.15,
  },

  avatarGlowAI: {
    backgroundColor: '#8b5cf6',
  },

  avatarText: {
    fontSize: 20,
  },

  messageHeaderText: {
    flex: 1,
  },

  messageLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
    letterSpacing: 0.3,
  },

  messageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  messageContent: {
    minHeight: 60,
    justifyContent: 'center',
  },

  messageText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#d1d1db',
    fontWeight: '400',
  },

  listeningIndicator: {
    alignItems: 'center',
    gap: 12,
  },

  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
  },

  bar: {
    width: 5,
    backgroundColor: '#6366f1',
    borderRadius: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  listeningTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  listeningPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  listeningText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  loadingState: {
    alignItems: 'center',
    gap: 10,
  },

  typingIndicator: {
    flexDirection: 'row',
    gap: 8,
  },

  typingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8b5cf6',
  },

  loadingStateText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  controlPanel: {
    position: 'relative',
    backgroundColor: '#12121a',
    borderTopWidth: 1,
    borderTopColor: '#1f1f2e',
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },

  controlPanelGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },

  microphoneSection: {
    alignItems: 'center',
  },

  micButton: {
    position: 'relative',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },

  micButtonActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },

  micButtonGlow: {
    position: 'absolute',
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: '#6366f1',
    opacity: 0.2,
  },

  micButtonInner: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  micIcon: {
    fontSize: 32,
  },

  stopIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stopSquare: {
    width: 18,
    height: 18,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },

  controlLabel: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  controlSubtext: {
    marginTop: 5,
    fontSize: 12,
    color: '#8b8b9a',
    fontWeight: '500',
  },

  footerText: {
    fontSize: 11,
    color: '#8b8b9a',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f1f2e',
    textAlign: 'center',
  },
  languageText: {
    marginTop: 16,
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.9,
  },
  settingsButton: {
    backgroundColor: '#1f1f2e',
    padding: 8,
    borderRadius: 20,
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  settingsIcon: {
    fontSize: 18,
    color: '#9ca3af',
  },

  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
  },

  glowOrb: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  innerOrb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowOpacity: 0.9,
    shadowRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  centerStatusText: {
    marginTop: 28,
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.9,
  },

  centerSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  centerReplyText: {
    marginTop: 20,
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

});