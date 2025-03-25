import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { sendGroupAnnouncement, scheduleEvent, inviteUserToGroup } from '../functions/firestoreService';

const AdminPanel = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [announcement, setAnnouncement] = useState('');
  const [eventDetails, setEventDetails] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) {
      Alert.alert("Error", "Please enter an announcement message.");
      return;
    }

    try {
      await sendGroupAnnouncement(groupId, announcement);
      Alert.alert("Success", "Announcement sent successfully!");
      setAnnouncement("");
    } catch (error) {
      Alert.alert("Error", `Failed to send the announcement: ${error.message}`);
    }
  };

  const handleScheduleEvent = async () => {
    if (!eventDetails.trim()) {
      Alert.alert('Error', 'Please enter event details.');
      return;
    }

    try {
      await scheduleEvent(groupId, eventDetails);
      Alert.alert('Success', 'Event scheduled successfully!');
      setEventDetails('');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule the event.');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Error", "Please enter a valid email.");
      return;
    }

    try {
      await inviteUserToGroup(groupId, inviteEmail);
      Alert.alert("Success", `Invitation sent to ${inviteEmail}!`);
      setInviteEmail('');
    } catch (error) {
      Alert.alert("Error", `Failed to send invite: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>

      <TextInput
        style={styles.input}
        value={announcement}
        onChangeText={setAnnouncement}
        placeholder="Enter announcement"
      />
      <TouchableOpacity style={styles.button} onPress={handleSendAnnouncement}>
        <Text style={styles.buttonText}>Post Announcement</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={eventDetails}
        onChangeText={setEventDetails}
        placeholder="Enter event details"
      />
      <TouchableOpacity style={styles.button} onPress={handleScheduleEvent}>
        <Text style={styles.buttonText}>Schedule Event</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={inviteEmail}
        onChangeText={setInviteEmail}
        placeholder="Enter user email"
      />
      <TouchableOpacity style={styles.button} onPress={handleInviteUser}>
        <Text style={styles.buttonText}>Invite User</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to Group</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: 250,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#888',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminPanel;
