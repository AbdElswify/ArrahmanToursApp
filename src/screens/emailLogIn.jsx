import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { auth } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const EmailLogIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Prevent multiple sign-ins
  const [checkingAuth, setCheckingAuth] = useState(true); // ✅ Prevents premature navigation

  // ✅ Ensure Auth State is Loaded Before Navigating
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in:", user.email);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); // ✅ Ensures clean navigation
      }
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  const handleLogIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true); // Prevent multiple clicks

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign-in successful:", email);
      // ✅ Navigation is handled by `onAuthStateChanged`
    } catch (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Signing In..." : "Log In"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Email Sign Up')}>
        <Text style={styles.link}>
          Don’t have an account? <Text style={styles.linkHighlight}>Sign Up</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Change Password')}>
        <Text style={styles.link}>
          Forgot Password? <Text style={styles.linkHighlight}>Change Password</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  button: {
    width: '90%',
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    fontSize: 14,
    color: '#555',
  },
  linkHighlight: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
});

export default EmailLogIn;
