// src/components/SettingsModal.js
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tts from 'react-native-tts';

const LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'ta-IN', label: 'Tamil' },
];

export default function SettingsModal({ visible, onClose, onLanguageChange }) {
  const [languageMode, setLanguageMode] = useState('auto');
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');

  useEffect(() => {
    (async () => {
      const savedMode = await AsyncStorage.getItem('languageMode');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (savedMode) setLanguageMode(savedMode);
      if (savedLang) setSelectedLanguage(savedLang);
    })();
  }, []);

 const saveSettings = async (mode, lang) => {
  try {
    await AsyncStorage.setItem('languageMode', mode);
    await AsyncStorage.setItem('selectedLanguage', lang);
    await Tts.setDefaultLanguage(lang);
    Alert.alert('Settings Saved', 'Your preferences have been updated.');

    // 👇 Notify parent
    if (onLanguageChange) onLanguageChange(lang, mode);


    onClose();
  } catch (err) {
    console.error('Error saving settings:', err);
  }
};

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Settings</Text>

          {/* Language Mode Toggle */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, languageMode === 'auto' && styles.modeTabActive]}
              onPress={() => setLanguageMode('auto')}>
              <Text style={[
                styles.modeTabText,
                languageMode === 'auto' && styles.modeTabTextActive
              ]}>
                Auto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, languageMode === 'manual' && styles.modeTabActive]}
              onPress={() => setLanguageMode('manual')}>
              <Text style={[
                styles.modeTabText,
                languageMode === 'manual' && styles.modeTabTextActive
              ]}>
                Manual
              </Text>
            </TouchableOpacity>
          </View>

          {/* Manual Language Picker */}
          {languageMode === 'manual' && (
            <View style={{ marginTop: 20 }}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    selectedLanguage === lang.code && styles.languageOptionSelected
                  ]}
                  onPress={() => setSelectedLanguage(lang.code)}>
                  <Text style={styles.languageOptionText}>{lang.label}</Text>
                  {selectedLanguage === lang.code && <Text style={styles.languageOptionCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => saveSettings(languageMode, selectedLanguage)}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#12121a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1f1f2e',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#1f1f2e',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#6366f1',
  },
  modeTabText: {
    color: '#9ca3af',
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f1f2e',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  languageOptionSelected: {
    borderColor: '#6366f1',
    borderWidth: 2,
  },
  languageOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  languageOptionCheck: {
    color: '#6366f1',
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1f1f2e',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    padding: 12,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
  },
  cancelText: {
    color: '#aaa',
    fontWeight: '600',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
});
