import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { createGroup } from '../functions/firestoreService';
import { getCurrentUser } from '../functions/authService';


/**
 * handleCreateGroup function to create a group with the given group name. If no group name is given, an alert will pop up
 * once a group is created, an alert will pop up and the user will be redirected to the group splash page, and pass
 * the group name to the page so it can fetch the group data.
 */
handleCreateGroup = async () => {
    if (!groupName) {
        Alert.alert('Error', 'Please enter a group name.');
        return;
    }

    try {
         user = await getCurrentUser();
        console.log(`Is this even working?`);
        console.log(`user: ${user}`);
        await createGroup(groupName);
        Alert.alert('Success', 'Group created successfully!');
        navigation.navigate('GroupSplashScreen', { groupName });
    } catch (error) {
        console.error('Error creating group:', error);
        Alert.alert('Error', 'An error occurred. Please try again.');
    }
};




const CreateGroupPage = ({ navigation }) => {
    const [groupName, setGroupName] = useState('');

    const handleCreateGroup = async () => {
        if (!groupName) {
            Alert.alert('Error', 'Please enter a group name.');
            return;
        }

        try {
            await createGroup(groupName);
            Alert.alert('Success', 'Group created successfully!');
            navigation.navigate('Home');
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

export default CreateGroupPage;

//create a styles.container to hold the title, input, and button
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
