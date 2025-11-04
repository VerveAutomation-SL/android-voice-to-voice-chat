import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../services/supabaseClient';

export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const logoScale = useRef(new Animated.Value(0)).current;
    const formScale = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.spring(formScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }, 
            },
        });
        setIsLoading(false);

        if (error) {
            Alert.alert('Signup Error', error.message);
        } else {
            Alert.alert(
                'Success',
                'Account created! Check your email for verification.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('SignIn')
                    }
                ]
            );
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Background layers */}
            <View style={styles.bgLayer1} />
            <View style={styles.bgLayer2} />
            
            {/* Decorative orbs */}
            <View style={styles.orb1} />
            <View style={styles.orb2} />

            <View style={styles.content}>
                {/* Logo Section */}
                <Animated.View 
                    style={[
                        styles.logoSection,
                        { 
                            opacity: fadeAnim,
                            transform: [{ scale: logoScale }]
                        }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.logoText}>AIVOICY</Text>
                    <View style={styles.logoDivider} />
                </Animated.View>

                {/* Welcome Text */}
                <Animated.View 
                    style={[
                        styles.welcomeSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.welcomeTitle}>Create Account</Text>
                    <Text style={styles.welcomeSubtitle}>Join us today</Text>
                </Animated.View>

                {/* Form Section */}
                <Animated.View 
                    style={[
                        styles.formContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: formScale }]
                        }
                    ]}
                >
                    {/* Name Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIconContainer}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
                        </View>
                        <TextInput
                            placeholder="Full Name"
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIconContainer}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
                        </View>
                        <TextInput
                            placeholder="Email address"
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.inputIconContainer}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color="rgba(255, 255, 255, 0.5)" />
                        </View>
                        <TextInput
                            placeholder="Password (min 6 characters)"
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            style={styles.input}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity 
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <MaterialCommunityIcons 
                                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                size={20} 
                                color="rgba(255, 255, 255, 0.5)" 
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity 
                        style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                        onPress={handleSignUp}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                                <Text style={styles.signUpButtonText}>Creating account...</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.signUpButtonText}>Create Account</Text>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Sign In Link */}
                    <TouchableOpacity 
                        style={styles.signInContainer}
                        onPress={() => navigation.navigate('SignIn')}
                    >
                        <Text style={styles.signInText}>Already have an account? </Text>
                        <Text style={styles.signInLink}>Sign In</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Bottom Indicator */}
                <Animated.View style={[styles.bottomIndicator, { opacity: fadeAnim }]}>
                    <View style={styles.indicatorDot} />
                    <Text style={styles.indicatorText}>Join Verve Automation</Text>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    bgLayer1: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '40%',
        backgroundColor: '#1a1530',
        opacity: 0.3,
    },

    bgLayer2: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '60%',
        backgroundColor: '#0f1729',
        opacity: 0.25,
    },

    orb1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(139, 92, 246, 0.06)',
        top: -100,
        right: -80,
    },

    orb2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(99, 102, 241, 0.04)',
        bottom: -50,
        left: -60,
    },

    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },

    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(139, 92, 246, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },

    logo: {
        width: 60,
        height: 60,
    },

    logoText: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 3,
        textShadowColor: 'rgba(139, 92, 246, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },

    logoDivider: {
        width: 50,
        height: 3,
        backgroundColor: '#8b5cf6',
        marginTop: 12,
        borderRadius: 2,
    },

    welcomeSection: {
        alignItems: 'center',
        marginBottom: 32,
    },

    welcomeTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
        letterSpacing: 0.5,
    },

    welcomeSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '500',
    },

    formContainer: {
        width: '100%',
    },

    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#12121a',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 14,
        paddingHorizontal: 16,
        height: 54,
    },

    inputIconContainer: {
        marginRight: 12,
    },

    input: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },

    eyeIcon: {
        padding: 8,
    },

    signUpButton: {
        backgroundColor: '#8b5cf6',
        borderRadius: 14,
        height: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 6,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    signUpButtonDisabled: {
        opacity: 0.7,
    },

    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    signUpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        gap: 16,
    },

    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    dividerText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },

    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    signInText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '500',
    },

    signInLink: {
        color: '#8b5cf6',
        fontSize: 14,
        fontWeight: '700',
    },

    bottomIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 32,
    },

    indicatorDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#8b5cf6',
    },

    indicatorText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '600',
        letterSpacing: 1,
    },
});