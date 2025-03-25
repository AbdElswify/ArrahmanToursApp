import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const GroupCard = ({groupId, groupName, onPress }) => {
    console.log(groupName)
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(groupId)} key={groupId}>
      <View style={styles.content}>
        <Text style={styles.groupName}>{groupName || 'Unnamed Group'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    width: 150,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  content: {
    alignItems: 'center',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  groupId: {
    fontSize: 12,
    color: '#888',
  },
});

export default GroupCard;
