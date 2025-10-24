import React from 'react';
import { useEffect, useRef } from 'react';
import { View, Image, Text, Animated, StatusBar, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const logoScale = useRef(new Animated.Value(0.85)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const glowPulse = useRef(new Animated.Value(0.6)).current;
    const lineWidth = useRef(new Animated.Value(0)).current;
    const particleOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 40,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(textOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(particleOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(lineWidth, {
                toValue: 1,
                duration: 700,
                useNativeDriver: false,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowPulse, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowPulse, {
                    toValue: 0.6,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

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
            
            {/* Background layers */}
            <View style={styles.bgLayer1} />
            <View style={styles.bgLayer2} />
            <View style={styles.bgLayer3} />
            
            {/* Animated particles */}
            <Animated.View style={[styles.particlesContainer, { opacity: particleOpacity }]}>
                {[...Array(8)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.particle,
                            {
                                left: `${15 + Math.random() * 70}%`,
                                top: `${10 + Math.random() * 80}%`,
                            },
                        ]}
                    />
                ))}
            </Animated.View>

            {/* Subtle orbs */}
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <Animated.View style={{ 
                opacity: fadeAnim, 
                transform: [{ scale: scaleAnim }],
                alignItems: 'center'
            }}>
                {/* Logo */}
                <Animated.View style={[
                    styles.logoContainer,
                    { 
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }]
                    }
                ]}>
                    {/* Animated glow */}
                    <Animated.View style={[styles.glowOuter, { opacity: glowPulse }]} />
                    
                    {/* Logo ring */}
                    <View style={styles.logoRing}>
                        <View style={styles.logoInnerRing}>
                            <Image source={require('../../assets/logo.png')} style={styles.logo} />
                        </View>
                    </View>

                    {/* Corner accents around logo */}
                    <View style={[styles.cornerLine, styles.topLeft]} />
                    <View style={[styles.cornerLine, styles.topRight]} />
                    <View style={[styles.cornerLine, styles.bottomLeft]} />
                    <View style={[styles.cornerLine, styles.bottomRight]} />
                </Animated.View>

                {/* Brand name */}
                <Animated.View style={[styles.brandContainer, { opacity: textOpacity }]}>
                    <Text style={styles.brand}>AIVOICY</Text>
                    
                    {/* Animated accent line */}
                    <View style={styles.accentLineContainer}>
                        <Animated.View 
                            style={[
                                styles.accentLine,
                                {
                                    width: lineWidth.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]} 
                        />
                    </View>
                </Animated.View>

                {/* Tagline with dividers */}
                <Animated.View style={[styles.taglineContainer, { opacity: textOpacity }]}>
                    <View style={styles.taglineDot} />
                    <Text style={styles.tagline}>PRODUCT OF VERVE AUTOMATION</Text>
                    <View style={styles.taglineDot} />
                </Animated.View>

                {/* Status indicator */}
                <Animated.View style={[styles.statusContainer, { opacity: textOpacity }]}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Initializing AI Systems</Text>
                </Animated.View>
            </Animated.View>

            {/* Bottom accent bar */}
            <View style={styles.bottomAccent}>
                <View style={styles.bottomBar} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0f',
    },

    bgLayer1: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '33%',
        backgroundColor: '#1a1530',
        opacity: 0.4,
    },

    bgLayer2: {
        position: 'absolute',
        top: '33%',
        width: '100%',
        height: '34%',
        backgroundColor: '#0f1729',
        opacity: 0.3,
    },

    bgLayer3: {
        position: 'absolute',
        top: '67%',
        width: '100%',
        height: '33%',
        backgroundColor: '#0a0a0f',
        opacity: 0.5,
    },

    particlesContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },

    particle: {
        position: 'absolute',
        width: 2,
        height: 2,
        backgroundColor: '#6366f1',
        borderRadius: 1,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 5,
    },

    orb1: {
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: 'rgba(79, 70, 229, 0.06)',
        top: -100,
        right: -80,
    },

    orb2: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        bottom: -80,
        left: -60,
    },

    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 45,
        position: 'relative',
    },

    glowOuter: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 8,
    },

    logoRing: {
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(99, 102, 241, 0.25)',
    },

    logoInnerRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },

    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },

    cornerLine: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: 'rgba(99, 102, 241, 0.4)',
        borderWidth: 2,
    },

    topLeft: {
        top: -10,
        left: -10,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },

    topRight: {
        top: -10,
        right: -10,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },

    bottomLeft: {
        bottom: -10,
        left: -10,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },

    bottomRight: {
        bottom: -10,
        right: -10,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },

    brandContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },

    brand: {
        fontSize: 46,
        color: '#ffffff',
        fontWeight: '800',
        letterSpacing: 10,
        marginBottom: 10,
        textShadowColor: 'rgba(99, 102, 241, 0.4)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
    },

    accentLineContainer: {
        width: 140,
        height: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        overflow: 'hidden',
    },

    accentLine: {
        height: '100%',
        backgroundColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
        elevation: 5,
    },

    taglineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 6,
    },

    taglineDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#8b5cf6',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },

    tagline: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '600',
        letterSpacing: 2.5,
    },

    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 35,
        paddingHorizontal: 18,
        paddingVertical: 9,
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },

    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 3,
    },

    statusText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.65)',
        fontWeight: '500',
        letterSpacing: 0.5,
    },

    bottomAccent: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
    },

    bottomBar: {
    
        width: '60%',
        height: 2,
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 3,
    },
});