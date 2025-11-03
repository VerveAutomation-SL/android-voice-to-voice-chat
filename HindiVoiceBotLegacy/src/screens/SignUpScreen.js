import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../services/supabaseClient';

export default function SignUpScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name }, 
            },
        });

        if (error) Alert.alert('Signup Error', error.message);
        else {
            Alert.alert('Success', 'Check your email for verification.');
            navigation.replace('SignIn');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                placeholder="Full Name"
                placeholderTextColor="#888"
                style={styles.input}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="Email"
                placeholderTextColor="#888"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                placeholder="Password"
                placeholderTextColor="#888"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.link}>Already have an account? Sign In</Text>
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
