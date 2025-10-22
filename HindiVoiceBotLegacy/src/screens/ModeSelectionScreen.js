import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ModeSelectionScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}> Choose Mode </Text>

            <View style={styles.OptionContainer}>
                <TouchableOpacity style={styles.card}
                    onPress={() => navigation.navigate('AskMe')}
                    activeOpacity={0.8}>
                    <MaterialCommunityIcons name="comment-text-outline" size={50} color="#6366f1" />
                    <Text style={styles.label}> Ask Me </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card}
                    onPress={() => navigation.navigate('Telephony')}
                    activeOpacity={0.8}>
                    <MaterialCommunityIcons name="phoner-classic" size={50} color="#10b981" />
                    <Text style={styles.label}> Telephony </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        color: '#fff',
        fontSize: 28,
        fontWeiht: '800',
        marginBottom: 40,
    },

    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
    },

    card: {
        width: 150,
        heoght: 150,
        backgroundColor: '#12121a',
        borderRadius: 20,
        alingItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#1f1f2e',
        elevation: 6,
    },

    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginTop: 12,
        letterSpacing: 0.5,
    },
});