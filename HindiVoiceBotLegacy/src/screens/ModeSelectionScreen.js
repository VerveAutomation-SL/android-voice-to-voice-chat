import React, { useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ModeSelectionScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const card1Scale = useRef(new Animated.Value(0.9)).current;
    const card2Scale = useRef(new Animated.Value(0.9)).current;
    const logoScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 100,
                useNativeDriver: true,
            }),
            Animated.spring(card1Scale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.spring(card2Scale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 450,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleCardPressIn = (scaleAnim) => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handleCardPressOut = (scaleAnim) => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Background layers */}
            <View style={styles.bgLayer1} />
            <View style={styles.bgLayer2} />
            
            {/* Minimal orbs */}
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            {/* Back Button */}
            <Animated.View style={[styles.backButton, { opacity: fadeAnim }]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButtonTouchable}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            {/* Status Section */}
            <Animated.View style={[styles.topSection, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="robot" size={28} color="#6366f1" />
                </View>
                <View style={styles.statusBadge}>
                    <View style={styles.statusDotActive} />
                    <Text style={styles.statusText}>Ready</Text>
                </View>
            </Animated.View>

            {/* Title Section */}
            <Animated.View 
                style={[
                    styles.headerSection,
                    { 
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <View style={styles.titleContainer}>
                    <Text style={styles.subtitle}>SELECT YOUR</Text>
                    <Text style={styles.title}>Mode</Text>
                    <View style={styles.titleUnderline} />
                </View>
                <Text style={styles.description}>Choose how you want to interact</Text>
            </Animated.View>

            {/* Cards Container */}
            <View style={styles.optionContainer}>
                {/* Ask Me Card */}
                <Animated.View style={{ transform: [{ scale: card1Scale }] }}>
                    <TouchableOpacity 
                        style={[styles.card, styles.cardAskMe]}
                        onPress={() => navigation.navigate('AskMe')}
                        onPressIn={() => handleCardPressIn(card1Scale)}
                        onPressOut={() => handleCardPressOut(card1Scale)}
                        activeOpacity={1}
                    >
                        <View style={[styles.iconContainer, styles.iconContainerAskMe]}>
                            <MaterialCommunityIcons name="message-text-outline" size={44} color="#6366f1" />
                        </View>
                        
                        <Text style={styles.label}>Ask Me</Text>
                        <Text style={styles.cardDescription}>Voice conversation mode</Text>
                        
                        {/* Feature Icons */}
                        <View style={styles.featureIcons}>
                            <View style={styles.featureItem}>
                                <MaterialCommunityIcons name="microphone" size={14} color="rgba(99, 102, 241, 0.8)" />
                                <Text style={styles.featureText}>Voice</Text>
                            </View>
                            <View style={styles.featureDivider} />
                            <View style={styles.featureItem}>
                                <MaterialCommunityIcons name="robot" size={14} color="rgba(99, 102, 241, 0.8)" />
                                <Text style={styles.featureText}>AI</Text>
                            </View>
                        </View>

                        {/* Corner accent */}
                        <View style={[styles.cornerAccent, styles.bottomRightAccent, { borderColor: 'rgba(99, 102, 241, 0.3)' }]} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Telephony Card */}
                <Animated.View style={{ transform: [{ scale: card2Scale }] }}>
                    <TouchableOpacity 
                        style={[styles.card, styles.cardTelephony]}
                        onPress={() => navigation.navigate('Telephony')}
                        onPressIn={() => handleCardPressIn(card2Scale)}
                        onPressOut={() => handleCardPressOut(card2Scale)}
                        activeOpacity={1}
                    >
                        <View style={[styles.iconContainer, styles.iconContainerTelephony]}>
                            <MaterialCommunityIcons name="phone" size={44} color="#10b981" />
                        </View>
                        
                        <Text style={styles.label}>Telephony</Text>
                        <Text style={styles.cardDescription}>Phone system integration</Text>
                        
                        {/* Feature Icons */}
                        <View style={styles.featureIcons}>
                            <View style={styles.featureItem}>
                                <MaterialCommunityIcons name="phone" size={14} color="rgba(16, 185, 129, 0.8)" />
                                <Text style={styles.featureText}>Call</Text>
                            </View>
                            <View style={styles.featureDivider} />
                            <View style={styles.featureItem}>
                                <MaterialCommunityIcons name="swap-horizontal" size={14} color="rgba(16, 185, 129, 0.8)" />
                                <Text style={styles.featureText}>Route</Text>
                            </View>
                        </View>

                        {/* Corner accent */}
                        <View style={[styles.cornerAccent, styles.bottomRightAccent, { borderColor: 'rgba(16, 185, 129, 0.3)' }]} />
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Bottom branding */}
            <Animated.View style={[styles.bottomIndicator, { opacity: fadeAnim }]}>
                <View style={styles.indicatorDot} />
                <Text style={styles.indicatorText}>AIVOICY · Verve Automation</Text>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bgLayer1: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '50%',
        backgroundColor: '#1a1530',
        opacity: 0.25,
    },

    bgLayer2: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
        backgroundColor: '#0f1729',
        opacity: 0.2,
    },

    orb1: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(99, 102, 241, 0.04)',
        top: -70,
        right: -50,
    },

    orb2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(16, 185, 129, 0.03)',
        bottom: -60,
        left: -40,
    },

    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },

    backButtonTouchable: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    topSection: {
        position: 'absolute',
        top: 60,
        alignItems: 'center',
        gap: 10,
    },

    logoContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },

    statusDotActive: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#10b981',
    },

    statusText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
        letterSpacing: 0.5,
    },

    headerSection: {
        alignItems: 'center',
        marginBottom: 50,
        marginTop: 75,
    },

    titleContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },

    subtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '600',
        letterSpacing: 2.5,
        marginBottom: 4,
    },

    title: {
        color: '#fff',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: 2,
        textShadowColor: 'rgba(99, 102, 241, 0.25)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },

    titleUnderline: {
        width: 70,
        height: 3,
        backgroundColor: '#6366f1',
        marginTop: 8,
        borderRadius: 2,
    },

    description: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
        letterSpacing: 0.5,
    },

    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        width: '90%',
        paddingHorizontal: 10,
    },

    card: {
        width: 165,
        height: 230,
        backgroundColor: '#12121a',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 28,
        paddingHorizontal: 20,
        borderWidth: 1,
        elevation: 6,
        position: 'relative',
        overflow: 'visible'
    },

    cardAskMe: {
        borderColor: 'rgba(99, 102, 241, 0.25)',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },

    cardTelephony: {
        borderColor: 'rgba(16, 185, 129, 0.25)',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },

    iconContainer: {
        width: 76,
        height: 76,
        borderRadius: 38,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },

    iconContainerAskMe: {
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },

    iconContainerTelephony: {
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },

    label: {
        color: '#fff',
        fontSize: 19,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginTop: 14,
    },

    cardDescription: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 16,
    },

    featureIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },

    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    featureText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
    },

    featureDivider: {
        width: 1,
        height: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    cornerAccent: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderWidth: 2,
    },

    bottomRightAccent: {
        bottom: 14,
        right: 14,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },

    bottomIndicator: {
        position: 'absolute',
        bottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    indicatorDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#6366f1',
    },

    indicatorText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '600',
        letterSpacing: 1,
    },
});