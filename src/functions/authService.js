import { auth, db, collection, doc, getDoc, setDoc, updateDoc, messaging } from "../config/firebaseConfig";
// Sign out function
export async function signOutUser() {
  return auth.signOut();
}

// Retrieve current user
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Subscribes to the Firestore user doc for the given uid for updated user data.
 * @param {string} uid - The user's unique Firebase Auth UID
 * @param {function} onData - Called with the Firestore data if doc exists (or null if missing)
 * @param {function} onError - Called if an error occurs
 * @returns {function} unsubscribe() - Call this to stop listening
 */
export function subscribeToUserDoc(uid, onData, onError) {
  const userDocRef = doc(db, "users", uid); // Get Firestore document reference

  return onSnapshot(
    userDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        onData(docSnapshot.data());
      } else {
        console.log(`No user document found in Firestore for UID: ${uid}`);
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
 * Creates or updates a user document in Firestore.
 */
export async function createUser(firstName, lastName, preferredName) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error("No authenticated user found.");
    return;
  }

  const userDocRef = doc(db, "users", currentUser.uid); // Correct way to reference a Firestore document.

  try {
   const documentSnapshot = await getDoc(userDocRef);

    const userData = {
      displayName: currentUser.displayName,
      email: currentUser.email,
      is_verified: currentUser.emailVerified,
      phone: currentUser.phoneNumber,
      role: "user",
      name: {
        firstName,
        lastName,
        preferredName,
        fullName: `${firstName} ${lastName}`,
      },
    };

    if (documentSnapshot.exists()) {
      await updateDoc(userDocRef, userData); // Use updateDoc() instead of update()
      console.log("User updated!");
    } else {
      await setDoc(userDocRef, userData); // Use setDoc() instead of set()
      console.log("User created!");
    }
  } catch (error) {
    console.error("Error creating/updating user document:", error);
  }
}

// Check if a Firestore collection exists
export const checkCollectionExists = async (collectionName) => {
  try {
    const snapshot = await collection(db, collectionName).limit(1).get();
    if (!snapshot.empty) {
      console.log(`Collection '${collectionName}' exists.`);
      return true;
    } else {
      console.log(`Collection '${collectionName}' does not exist or is empty.`);
      return false;
    }
  } catch (error) {
    console.error('Error checking collection existence:', error);
    return false;
  }
};

export async function saveUserFcmToken(userId) {
  try {
    const token = await messaging().getToken();
    console.log('FCM token:', token);

    if (!token) {
      console.error('Failed to get FCM token.');
      return;
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { fcmToken: token });
    console.log('FCM token saved for user:', userId);
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}



