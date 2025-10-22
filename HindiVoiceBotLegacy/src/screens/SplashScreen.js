import React from 'react';
import { useEffect, useRef } from 'react';
import { View, Image, Text, Animated, StatusBar, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
                Animated.timing(scaleAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
            ]).start(() =>
                navigation.replace('ModeSelection'));
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} />
                <Text style={styles.brand}>AIVOICY</Text>
                <Text style={styles.tagline}>Product of Verve Automation</Text>
            </Animated.View>
        </View>
    );
}

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#0a0a0f',
            justifyContent: 'center',
            alignItems: 'center'
        },

        logo: {
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 20,
        },

        brand: {
            fontSize: 42,
            color: '#fff',
            fontWeight: '900',
            letterSpacing: 4,
        },

        tagline: {
            fontSize: 14,
            color: '8b8b9a',
            marginTop: 10,
        },
    });
