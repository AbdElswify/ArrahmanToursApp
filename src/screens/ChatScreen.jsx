import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { getChatMessages, sendChatMessage, getUserNameById } from '../functions/firestoreService';
import { getCurrentUser } from '../functions/authService';

const ChatScreen = ({ route }) => {
  const { groupId } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    let unsubscribe;
    const fetchMessages = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      unsubscribe = getChatMessages(groupId, async (msgs) => {
        const names = { ...userNames };

        for (const msg of msgs) {
          if (!names[msg.senderId]) {
            names[msg.senderId] = await getUserNameById(msg.senderId);
          }
        }

        setUserNames(names);
        setMessages(msgs);
      });
    };

    fetchMessages();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [groupId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    await sendChatMessage(groupId, user.uid, newMessage);
    setNewMessage('');
  };

  return (
    <View style={styles.container}>
     <FlatList
             data={messages}
             keyExtractor={(item, index) => `${item.id}-${index}`} // 🔹 Ensure uniqueness
             renderItem={({ item }) => (
               <View style={[styles.messageContainer, item.senderId === user?.uid && styles.myMessage]}>
                 <Text style={styles.sender}>{userNames[item.senderId] || "Loading..."}</Text>
                 <Text style={styles.messageText}>{item.text}</Text>
               </View>
             )}
           />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  messageContainer: { padding: 10, borderRadius: 8, marginBottom: 5, backgroundColor: '#eee' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#6200EE', color: '#fff' },
  sender: { fontWeight: 'bold' },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  input: { flex: 1, borderWidth: 1, padding: 10, borderRadius: 5, marginRight: 10 },
  sendButton: { backgroundColor: '#6200EE', padding: 10, borderRadius: 5 },
  sendText: { color: '#fff' },
});

export default ChatScreen;




