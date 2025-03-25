import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeToUserDoc, getGroupData, getUserAnnouncements } from '../functions/firestoreService';
import { signOutUser } from '../functions/authService';
import { auth, ScrollView } from '../config/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import GroupCard from '../components/groupCard';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [firestoreUser, setFirestoreUser] = useState(null);
  const [groupsData, setGroupsData] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is authenticated:", user.email);
        const unsubscribeUserDoc = subscribeToUserDoc(
          user.uid,
          (data) => setFirestoreUser(data),
          (error) => console.error(error)
        );
        setAuthChecked(true);
        return () => unsubscribeUserDoc();
      } else {
        console.log("No authenticated user found. Redirecting to login.");
        navigation.replace('Email Log In');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchGroupsAndAnnouncements = async () => {
      if (firestoreUser?.groups?.length > 0) {
        setLoadingGroups(true);
        try {
          const fetchedGroups = await Promise.all(
            firestoreUser.groups.map(async (groupId) => {
              const data = await getGroupData(groupId);
              return { groupId, ...data };
            })
          );
          setGroupsData(fetchedGroups);

          const allAnnouncements = await getUserAnnouncements(firestoreUser.groups);
          setAnnouncements(allAnnouncements);
        } catch (error) {
          console.error('Error fetching groups or announcements:', error);
        } finally {
          setLoadingGroups(false);
        }
      } else {
        setLoadingGroups(false);
      }
    };

    if (authChecked) {
      fetchGroupsAndAnnouncements();
    }
  }, [firestoreUser, authChecked]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      Alert.alert('Success', 'You have been logged out.');
      navigation.replace('Email Log In');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
      <ScrollView>
    <View style={[styles.safeContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {authChecked ? (
        <>
          <View style={styles.banner}>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>btn</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate('Create Group')}>
              <Text style={styles.bannerButtonText}>Add Group</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainContent}>
            {firestoreUser ? (
              <>
                <Text style={styles.text}>
                  Welcome, {firestoreUser.name?.preferredName || 'No name'}!
                </Text>

                {announcements.length > 0 && (
                  <View style={styles.announcementSection}>
                    <Text style={styles.announcementTitle}>Group Announcements</Text>
                    <ScrollView style={styles.announcementScroll}>
                      {announcements.map((a, index) => (
                        <View key={index} style={styles.announcementCard}>
                          <Text style={styles.announcementGroup}>{a.groupName}</Text>
                          <Text>{a.message}</Text>
                          <Text style={styles.announcementTimestamp}>
                            {a.timestamp.toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}


                {loadingGroups ? (
                  <ActivityIndicator size="large" color="#6200EE" />
                ) : (
                  <View style={styles.cardContainer}>
                    {groupsData.length > 0 ? (
                      groupsData.map((group) => (
                        <GroupCard
                          key={group.groupId}
                          groupId={group.groupId}
                          groupName={group.groupName || `Group ${group.groupId.substring(0, 6)}`}
                          onPress={() => navigation.navigate('Group Page', { groupId: group.groupId })}
                        />
                      ))
                    ) : (
                      <Text style={styles.text}>You are not in any groups yet.</Text>
                    )}
                  </View>
                )}
                <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                  <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <ActivityIndicator size="large" color="#6200EE" />
            )}
          </View>
        </>
      ) : (
        <ActivityIndicator size="large" color="#6200EE" style={styles.loading} />
      )}
    </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  banner: {
    backgroundColor: '#6200EE',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButton: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
  },
  bannerButtonText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  announcementCard: {
    backgroundColor: '#EEE',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  announcementGroup: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  announcementTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
});
