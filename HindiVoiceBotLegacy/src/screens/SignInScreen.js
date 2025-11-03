import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../services/supabaseClient';

export default function SignInScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert('Login Error', error.message);
        else navigation.replace('AskMe');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
            <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.link}>Don’t have an account? Register</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#0a0a0f'
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20
    },

    input: {
        backgroundColor: '#1f1f2e',
        color: '#fff',
        marginBottom: 12,
        padding: 14,
        borderRadius: 8
    },

    button: {
        backgroundColor: '#6366f1',
        padding: 14,
        borderRadius: 10
    },

    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: '700'
    },

    link: {
        color: '#8b5cf6',
        textAlign: 'center',
        marginTop: 20
    }
});
