import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { checkIfAdmin, getGroupData, getUserNameById } from '../functions/firestoreService';
import { getCurrentUser } from '../functions/authService';

const GroupPage = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [isAdmin, setIsAdmin] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [memberNames, setMemberNames] = useState({});

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const data = await getGroupData(groupId);
        setGroupData(data);

        // Fetch user names
        const names = {};
        for (const userId of Object.keys(data.groupMembers || {})) {
          names[userId] = await getUserNameById(userId);
        }
        setMemberNames(names);
        console.log("Updated Member Names:", names); // Debugging
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };

    const checkAdminStatus = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;
        const data = await getGroupData(groupId);
        if (data?.groupMembers) {
          setIsAdmin(data.groupMembers[user.uid]?.role === "admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    fetchGroupDetails();
    checkAdminStatus();
  }, [groupId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{groupData ? groupData.groupName : 'Group Page'}</Text>

      {/* Display Members with Names */}
      {groupData && (
        <FlatList
          data={Object.keys(groupData.groupMembers || {})}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Text style={styles.memberText}>
              {memberNames[item] || "Loading..."} {/* ✅ Display correct name */}
            </Text>
          )}
        />
      )}

          {isAdmin && (
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminPanel', { groupId })}>
                      <Text style={styles.buttonText}>Manage Group</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChatScreen', { groupId })}>
                    <Text style={styles.buttonText}>Open Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CalendarScreen', { groupId })}>
                    <Text style={styles.buttonText}>View Calendar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Back to Home</Text>
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
  memberText: {
    fontSize: 16,
    marginBottom: 5,
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

export default GroupPage;




