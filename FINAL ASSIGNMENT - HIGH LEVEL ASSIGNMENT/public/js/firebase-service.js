// Firebase Cloud Integration Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// User's Google Firebase Credentials
const firebaseConfig = {
  apiKey: "AIzaSyDRsW40uuS4Gex0NDtrtuQCS7pjjacIxVo",
  authDomain: "cloud-based-file-storage-d8582.firebaseapp.com",
  projectId: "cloud-based-file-storage-d8582",
  storageBucket: "cloud-based-file-storage-d8582.firebasestorage.app",
  messagingSenderId: "444354305077",
  appId: "1:444354305077:web:f8f62235f94d2f67c2657c",
  measurementId: "G-GQMDCLKVBS"
};

// Initialize Firebase App Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export const FirebaseService = {
  app,
  auth,
  storage,
  db,

  // Firebase Auth Methods
  async loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async registerUser(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout() {
    await signOut(auth);
  },

  // Direct Google Cloud Storage Upload
  async uploadFileToCloudStorage(fileBlob, cloudPath, onProgress) {
    const storageRef = ref(storage, cloudPath);
    const uploadTask = uploadBytesResumable(storageRef, fileBlob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error("Firebase Storage Upload Error:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadURL, fullPath: uploadTask.snapshot.ref.fullPath });
        }
      );
    });
  },

  // Download Blob from Cloud Storage URL
  async fetchCloudBlob(downloadURL) {
    const response = await fetch(downloadURL);
    return await response.blob();
  },

  // Save metadata into Firebase Firestore Database
  async saveFileMetadataToFirestore(fileMetadata) {
    const docRef = await addDoc(collection(db, "files"), {
      ...fileMetadata,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Firestore Realtime Comments Listener
  subscribeComments(fileId, callback) {
    const q = query(
      collection(db, `files/${fileId}/comments`),
      orderBy("timestamp", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(comments);
    }, (error) => {
      console.warn("Firestore comments subscription fallback to local API:", error);
    });
  },

  async addFirestoreComment(fileId, commentData) {
    return await addDoc(collection(db, `files/${fileId}/comments`), {
      ...commentData,
      timestamp: serverTimestamp()
    });
  }
};
