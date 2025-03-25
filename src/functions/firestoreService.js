import {uuidv4, getDocs, where, addDoc, query, messaging, auth, db, collection, doc, FieldValue, onSnapshot, updateDoc, setDoc, getDoc, arrayUnion, arrayRemove, serverTimestamp, orderBy} from "../config/firebaseConfig";

/**
 * Subscribes to the Firestore user doc for the given uid.
 */
export function subscribeToUserDoc(uid, onData, onError) {
  const userDocRef = doc(db, "users", uid); // Get Firestore document reference

  return onSnapshot(
    userDocRef, // Pass document reference into onSnapshot()
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        onData(docSnapshot.data());
      } else {
        console.log(`No user document found for UID: ${uid}`);
        onData(null);
      }
    },
    (error) => {
      console.error("Error fetching user document:", error);
      if (onError) onError(error);
    }
  );
}

/**
 * Creates a new group object in the group collection.
 */
export async function createGroup(groupName, creatorId) {
  const groupRef = doc(collection(db, "groups")); // Auto-generate group ID

  const newGroup = {
    groupName,
    groupDocuments: [],
    groupMembers: {
      [creatorId]: {
        role: "admin",  // ✅ Ensure creator is admin
        userRef: `/users/${creatorId}`,
      },
    },
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(groupRef, newGroup);

    // Add the group ID to the user's document
    const userRef = doc(db, "users", creatorId);
    await updateDoc(userRef, {
      groups: arrayUnion(groupRef.id),
    });

    console.log("Group created successfully!");
  } catch (error) {
    console.error("Error creating group:", error);
  }
}


/**
 * Adds a new member to the Firestore group document.
 */
export async function addMember(groupId, newUserID, role) {
  const newUser = {
    userID: newUserID,
    role,
    userRef: `/users/${newUserID}`,
  };

  try {
    const groupRef = doc(db, "groups", groupId);
    await groupRef.update({
      groupMembers: FieldValue.arrayUnion(newUser),
    });
  } catch (error) {
    console.error('Error adding member:', error);
  }
}

/**
 * Removes a member from the Firestore group document.
 */
export async function removeMember(groupId, userID) {
  try {
    const groupRef = doc(db, "groups", groupId);
    await groupRef.update({
      groupMembers: FieldValue.arrayRemove(userID),
    });
  } catch (error) {
    console.error('Error removing member:', error);
  }
}

/**
 * Get Group data by ID.
 */
export async function getGroupData(groupId) {
  try {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef); // ✅ Corrected

    if (groupSnap.exists()) {
      const data = groupSnap.data();
      console.log(`Group Data: ${JSON.stringify(data)}`);
      return data;
    } else {
      console.log("No such group!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching group data:", error);
  }
}

export function getChatMessages(groupId, setMessages) {
  const messagesRef = collection(db, "groups", groupId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMessages(messages); // ✅ Update messages state
  });
}

export async function sendChatMessage(groupId, senderId, message) {
  try {
    if (!message.trim()) return;

    const messagesRef = collection(db, "groups", groupId, "messages");

    const newMessage = {
      id: uuidv4(), // 🔹 Generate a completely unique ID
      senderId,
      text: message.trim(),
      timestamp: serverTimestamp(),
    };

    await addDoc(messagesRef, newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// ✅ Function to invite a user to a group by email
export async function inviteUserToGroup(groupId, userEmail) {
  try {
    // 🔹 Check if the user exists in the `users` collection
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found. Ensure they are registered.");
    }

    // 🔹 Get the user's ID
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // 🔹 Get reference to the group document
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error("Group does not exist.");
    }

    // 🔹 Update the group members list
    await updateDoc(groupRef, {
      [`groupMembers.${userId}`]: {
        role: "member",
        userRef: `/users/${userId}`,
      },
    });

    // 🔹 Update user's document to add the group
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      groups: [...(userDoc.data().groups || []), groupId],
    });

  } catch (error) {
    console.error("Error inviting user:", error);
    throw error;
  }
}


// ✅ Fix: Fetch user's preferred name correctly
export async function getUserNameById(userId) {
  try {
    if (!userId) return "Unknown User"; // Ensure userId is valid

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log(`Fetched name for ${userId}:`, userData); // Debugging output
      return (
        userData?.preferredName || // Check direct preferredName field
        userData?.name?.preferredName || // Check nested structure (like in HomeScreen)
        userData?.displayName || // Fallback to displayName
        "Unknown User"
      );
    } else {
      console.error(`User document not found for ID: ${userId}`);
    }
  } catch (error) {
    console.error("Error fetching user name:", error);
  }
  return "Unknown User";
}



export async function requestPushNotificationPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log("Push Notification permission granted.");
  } else {
    console.log("Push Notification permission denied.");
  }
}
// ✅ PLACE THIS OUTSIDE of any other function or if-block

export async function getUserAnnouncements(groupIds) {
  const announcements = [];

  for (const groupId of groupIds) {
    const groupRef = doc(db, "groups", groupId);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const groupData = groupSnap.data();
      if (groupData.announcements?.length > 0) {
        groupData.announcements.forEach((a) => {
          announcements.push({
            message: a.message,
            timestamp: a.timestamp?.toDate?.() || new Date(),
            groupName: groupData.groupName || "Unnamed Group",
          });
        });
      }
    }
  }

  return announcements.sort((a, b) => b.timestamp - a.timestamp);
}

