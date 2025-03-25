import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { createGroup } from '../functions/firestoreService';
import { getCurrentUser } from '../functions/authService';

const CreateGroupPage = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async () => {
    if (!groupName) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }

    try {
      // Get current user details
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a group');
        return;
      }

      // Call the create group function
      await createGroup(groupName, user.uid);
      Alert.alert('Success', 'Group created successfully!');
      navigation.navigate('Home'); // Navigate back to the home screen
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={groupName}
        onChangeText={setGroupName}
      />
      <Button title="Create Group" onPress={handleCreateGroup} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    marginBottom: 20,
  },
});

export default CreateGroupPage;

