import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { getGroupEvents, addGroupEvent } from '../functions/firestoreService';
import { getCurrentUser } from '../functions/authService';

const CalendarScreen = ({ route }) => {
  const { groupId } = route.params;
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const user = await getCurrentUser();
      setIsAdmin(user?.role === 'admin');
      const unsubscribe = getGroupEvents(groupId, setEvents);
      return () => unsubscribe();
    };
    fetchEvents();
  }, [groupId]);

  const handleAddEvent = async () => {
    if (!newEvent.trim()) return;
    await addGroupEvent(groupId, newEvent);
    setNewEvent('');
    Alert.alert('Event Added', 'The event has been scheduled.');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text>{item.details}</Text>
          </View>
        )}
      />
      {isAdmin && (
        <>
          <TextInput style={styles.input} placeholder="Enter event details" value={newEvent} onChangeText={setNewEvent} />
          <TouchableOpacity style={styles.button} onPress={handleAddEvent}>
            <Text style={styles.buttonText}>Add Event</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  eventItem: { padding: 10, borderBottomWidth: 1 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10 },
  button: { backgroundColor: '#6200EE', padding: 10, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center' },
});

export default CalendarScreen;
