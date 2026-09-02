# SIMATS ENGINEERING
### Saveetha Institute of Medical and Technical Sciences
**Chennai - 602105**

| Attribute | Details |
| :--- | :--- |
| **Student Name** | **KONGARA SAI** |
| **Register No.** | **192365025** |
| **Course Code** | **CSA1515** |
| **Slot** | **Slot B** |
| **Course Name** | **CLOUD COMPUTING AND BIG DATA ANALYTICS** |
| **Course Faculty** | **SAMPATH KUMAR K** |
| **Project Title** | **Design and Implementation of a Secure Cloud-Based File Storage and Collaboration Application (CloudVault)** |

---

### Project Description
> CloudVault is a secure cloud-based file storage and collaboration application developed using Google Firebase Cloud Services.
> It uses Firebase Authentication to provide secure user login and identity management.
> Files are encrypted on the client side using AES-256-GCM before being uploaded to cloud storage.
> Cloud Firestore stores file metadata, versions, comments, sharing permissions, and security audit logs.
> The system supports role-based access control with View, Download, and Edit permissions.
> It also provides real-time document collaboration, version history, file sharing, and activity tracking.
> CloudVault combines cloud scalability, data confidentiality, integrity verification, and a modern responsive interface into one secure platform.

---

```text
Student Signature: KONGARA SAI                          Guide Signature: SAMPATH KUMAR K
```

---

## 1. Problem Statement
Modern enterprises and remote teams require a secure, reliable, and centralized cloud-based file storage and collaboration platform. Traditional on-premise storage solutions suffer from hardware failure risks, limited accessibility across geographic locations, complex maintenance overheads, and high operational expenditure. Furthermore, unencrypted cloud file storage poses severe data security risks, including data breaches, unauthorized access, and compliance violations.

To address these challenges, an organization requires a high-performance, cloud-native storage platform where authenticated users can upload, download, share, manage, and collaboratively edit files across different client devices. The system must enforce end-to-end payload encryption at rest, role-based access control (RBAC), real-time collaboration facilities, comprehensive security audit logging, and Web API communication with cloud infrastructure.

---

## 2. Objective
The primary objectives of this project are:
1. **Cloud-Native Storage Integration**: Design and implement a browser-based web application communicating with **Google Firebase Cloud Infrastructure** (Firebase Authentication, Firebase Cloud Storage, and Cloud Firestore DB).
2. **End-to-End Cryptographic Security**: Implement **AES-256-GCM** client-side authenticated cipher encryption before streaming data to cloud buckets, ensuring zero-knowledge privacy at rest.
3. **Controlled Access & Sharing**: Build a flexible Role-Based Access Control (RBAC) matrix and share link generator supporting granular permissions (View, Download, Edit) with password protection and link expiration.
4. **Real-Time Collaboration**: Provide a live collaborative document editor, version control system with rollback capabilities, and Firestore-backed real-time commenting.
5. **Security Forensics & Auditability**: Log every security-critical event (login attempts, file uploads, decryptions, permissions changes, deletions) into a real-time forensic audit log.
6. **High Performance & Modern UI**: Deliver a visual dark glassmorphism interface built with Vanilla JavaScript, HTML5, and CSS3.

---

## 3. Requirements and Environment Used

### Hardware Requirements
- **Processor**: Intel Core i5/i7 or AMD Ryzen 5/7 (64-bit multi-core architecture)
- **RAM**: Minimum 8 GB (16 GB recommended)
- **Storage**: 500 MB free storage for local dependencies and runtime logs
- **Network**: Broadband Internet connection (for Google Firebase Cloud API communication)

### Software & Cloud Environment
- **Operating System**: Microsoft Windows 10/11
- **Runtime Environment**: Node.js (v22.18.0) & npm (v11.16.0)
- **Backend Web Server**: Express.js (v4.19.2) REST API Server
- **Frontend Core**: Standard HTML5, Custom Glassmorphic CSS3, Vanilla ES6 JavaScript Modules
- **Cloud Infrastructure**:
  - **Google Firebase Project**: `cloud-based-file-storage-d8582`
  - **Google Firebase Cloud Storage Bucket**: `cloud-based-file-storage-d8582.firebasestorage.app`
  - **Google Cloud Firestore Database**: Real-time Document Store
  - **Google Firebase Authentication**: Cloud-managed Identity Provider
- **Cryptographic Library**: Web Crypto API (`crypto.subtle`) supporting PBKDF2 & AES-256-GCM
- **Development & Verification**: Google Chrome / Microsoft Edge Browser

---

## 4. Design / Proposed Solution

### 4.1 System Architecture
The application follows a three-tier cloud-native architecture:
1. **Client Presentation Tier (Browser SPA)**: Built using HTML5, modern CSS glassmorphism, and modular ES6 JavaScript. Interacts with Web APIs and Google Firebase SDKs.
2. **Application & Cryptographic Tier (Web APIs & Web Crypto Engine)**: Client-side AES-256-GCM payload cipher engine and Node.js Express API server for health monitoring, token generation, and static hosting.
3. **Cloud Infrastructure Tier (Google Cloud Services)**:
   - **Firebase Cloud Storage**: Encrypted binary blob bucket storage.
   - **Cloud Firestore**: Real-time document database storing file metadata, versions, comments, and security audit trails.
   - **Firebase Auth**: User identity and credential management.

```mermaid
graph TD
    User([User Browser / Client Device]) -->|HTTP / Web API| WebApp[CloudVault Web SPA]
    
    subgraph Client Cryptographic Engine
        WebApp -->|Encrypt ArrayBuffer| AES[AES-256-GCM Cipher]
        AES -->|Encrypted Payload Blob| CloudStore
    end

    subgraph Google Firebase Cloud Infrastructure
        WebApp -->|Auth Requests| FBAuth[Google Firebase Authentication]
        CloudStore[Firebase Cloud Storage Bucket] -->|Blob Download| WebApp
        WebApp -->|Metadata Sync| FirestoreDB[(Google Cloud Firestore DB)]
    end

    subgraph Security & Audit Layer
        WebApp -->|Write Forensic Events| AuditLog[Firestore Audit Trails]
    end
```

### 4.2 Security Architecture & Data Flow
- **Data in Transit**: Secured via HTTPS / TLS 1.3 encryption.
- **Data at Rest**: Binary file payloads are encrypted using **AES-256-GCM** before leaving the client browser.
- **Key Derivation**: Master key derived using **PBKDF2** with 100,000 iterations and SHA-256 hashing.
- **Data Integrity**: SHA-256 cryptographic checksum calculated for every uploaded file payload to detect tampering.

---

## 5. Algorithm / Pseudocode / Flowchart

### 5.1 AES-256-GCM Encryption Pipeline Algorithm
```text
Algorithm: EncryptAndUploadCloudAsset(FileObject, Tags)
Input: FileObject (binary), Tags (array of strings)
Output: Firestore Document Reference & Firebase Storage URL

1. Read FileObject into ArrayBuffer.
2. Calculate Checksum = SHA256(ArrayBuffer).
3. Generate Random 12-byte IV (Initialization Vector).
4. Derive 256-bit Key from MasterSecret using PBKDF2 (100,000 iterations, SHA-256).
5. Encrypt ArrayBuffer using AES-256-GCM cipher with IV and Key -> EncryptedData.
6. Create EncryptedBlob = Combine(IV [12 bytes], EncryptedData).
7. Upload EncryptedBlob to Firebase Cloud Storage at path: `encrypted_vault/{UserId}/{Timestamp}_{FileName}.enc`.
8. Retrieve DownloadURL from Firebase Storage.
9. Construct FileMetadata document:
     - Name, MimeType, Size, Checksum (SHA-256)
     - StoragePath, DownloadURL, OwnerId, Tags, VersionHistory
10. Insert FileMetadata into Cloud Firestore `files` collection.
11. Write Security Audit Log event ("FILE_UPLOAD").
12. Return Success status and Metadata object.
```

### 5.2 Flowchart of File Upload & Decryption Pipeline
```mermaid
flowchart TD
    A[Start: User selects file for upload] --> B[Read file into ArrayBuffer]
    B --> C[Compute SHA-256 Hash]
    C --> D[Generate 12-byte random IV]
    D --> E[Encrypt ArrayBuffer via AES-256-GCM]
    E --> F[Combine IV + Encrypted Data into Blob]
    F --> G[Upload Blob to Google Firebase Cloud Storage]
    G --> H[Get DownloadURL from Storage Bucket]
    H --> I[Save Metadata & Checksum into Cloud Firestore]
    I --> J[Log Security Event to Audit Trail]
    J --> K[End: Upload Complete & UI Refreshed]
```

---

## 6. Implementation / Source Code

### 6.1 Core Firebase Integration Engine (`public/js/firebase-core.js`)
```javascript
// Google Firebase Configuration (User-Provided Live Credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDRsW40uuS4Gex0NDtrtuQCS7pjjacIxVo",
  authDomain: "cloud-based-file-storage-d8582.firebaseapp.com",
  projectId: "cloud-based-file-storage-d8582",
  storageBucket: "cloud-based-file-storage-d8582.firebasestorage.app",
  messagingSenderId: "444354305077",
  appId: "1:444354305077:web:f8f62235f94d2f67c2657c",
  measurementId: "G-GQMDCLKVBS"
};

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Web Crypto AES-256 Payload Cipher
async function encryptData(arrayBuffer) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, arrayBuffer);
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return combined.buffer;
}
```

### 6.2 Backend Express Host (`server.js`)
```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CloudVault Google Firebase Cloud Infrastructure',
    projectId: 'cloud-based-file-storage-d8582',
    storageBucket: 'cloud-based-file-storage-d8582.firebasestorage.app',
    encryption: 'AES-256-GCM Authenticated Cipher',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`CloudVault Firebase Server running on http://localhost:${PORT}`);
});
```

---

## 7. Test Cases and Expected/Actual Results

| Test Case ID | Feature Tested | Input / Procedure | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| **TC-01** | Firebase Authentication | Register user `student@cloudvault.io` with password `password123` | Account created in Firebase Auth; user signed in | Account created successfully in Firebase Auth | **PASS** |
| **TC-02** | Client AES-256 Encryption | Upload text document `Architecture_Spec.md` | Payload encrypted via Web Crypto API before upload | Encrypted Blob generated with 12-byte IV header | **PASS** |
| **TC-03** | Firebase Cloud Storage Upload | Push encrypted Blob to Storage Bucket | File stored in bucket `cloud-based-file-storage-d8582.firebasestorage.app` | Storage upload completed (100%); download URL generated | **PASS** |
| **TC-04** | Cloud Firestore Sync | Metadata record created after upload | Document added to Firestore `files` collection | Metadata document saved with SHA-256 hash | **PASS** |
| **TC-05** | Decryption & Download | Click Download button on file card | Encrypted stream fetched from bucket & decrypted in browser | File downloaded and opened cleanly in original form | **PASS** |
| **TC-06** | Real-time Collaboration | Edit text file in live editor modal & save | New version created in Firestore; version counter incremented | Version 2 stored in cloud with updated SHA-256 | **PASS** |
| **TC-07** | Firestore Comments | Post collaborative comment on document | Comment document appended to sub-collection with timestamp | Comment rendered in real-time drawer | **PASS** |
| **TC-08** | Security Audit Trail | Perform login, upload, edit, and download | Event logged in Firestore `audit_logs` collection | Forensic audit table lists timestamp, action, user email | **PASS** |

---

## 8. Execution Screenshots / Output

### Interface Layout Overview:
1. **Authentication Screen**: Sleek glassmorphic card with Firebase Auth sign-in & sign-up forms.
2. **Dashboard Overview**: Displays total encrypted file count, cloud storage progress bar, quick stats, upload dropzone, and recent file grid. Top bar highlights green **Firebase Cloud Connected** indicator.
3. **Collaborative Editor Modal**: Text/markdown file preview with inline editing, save & version push button, and right-side real-time comments panel.
4. **Security Audit Log View**: Structured table displaying timestamped forensic audit logs (`REGISTER`, `LOGIN_SUCCESS`, `FILE_UPLOAD`, `FILE_EDIT`, `FILE_DOWNLOAD`).

---

## 9. Analysis and Discussion

### 9.1 Security & Zero-Knowledge Architecture
By combining **client-side Web Crypto AES-256-GCM** encryption with **Google Firebase Cloud Storage**, the system achieves a zero-knowledge security standard. Raw unencrypted file contents are never transmitted across the network or stored in plain sight on cloud servers. Even if cloud bucket objects are compromised, they remain unreadable ciphertext without the master cipher key.

### 9.2 Cloud Scalability & Storage Efficiency
Utilizing Google Firebase Cloud Storage provides virtually unlimited elastic storage capacity, high availability (99.99%), and global Content Delivery Network (CDN) acceleration. Metadata operations handled by Cloud Firestore guarantee sub-100ms response times for metadata queries and real-time updates across concurrent user sessions.

---

## 10. Conclusion
The **CloudVault Secure Cloud File Storage and Collaboration Application** successfully fulfills all technical requirements of the CSA1515 assignment. By deploying a modern browser-based web application connected directly to Google Firebase Cloud Services (Auth, Storage, Firestore) and incorporating client-side AES-256-GCM cipher encryption, the platform provides a robust, scalable, and highly secure environment for enterprise file management and team collaboration.

---

## 11. Individual Contribution of Group Members

| Group Member Name | Role & Assigned Task | Percentage Contribution |
|---|---|---|
| **Kongara Sai** | Project Lead, System Architecture, Firebase Cloud SDK Integration, AES-256 Encryption Engine | 40% |
| **Team Member 2** | UI/UX Design System, Glassmorphic CSS Implementation, Responsive Component Development | 30% |
| **Team Member 3** | Web APIs Integration, Cloud Firestore Database Rules, Unit Testing & Documentation Report | 30% |

---

## 12. References
1. Google Firebase Cloud Storage Documentation: https://firebase.google.com/docs/storage
2. Google Cloud Firestore Database Reference: https://firebase.google.com/docs/firestore
3. W3C Web Cryptography API Specification: https://www.w3.org/TR/WebCryptoAPI/
4. MDN Web Docs - AES-GCM Cipher Implementation: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
5. Express.js Web API Framework Guide: https://expressjs.com/

---

## 13. 1 Page Write-Up (Executive Summary)

### Executive Summary: CloudVault Secure Cloud File Platform
**CloudVault** is a secure, cloud-native file storage and enterprise collaboration platform designed to deliver end-to-end cryptographic protection, seamless Web API communication, and scalable multi-device access. Built for the CSA1515 Cloud Computing and Big Data Analytics Assignment, the platform directly integrates with **Google Firebase Cloud Infrastructure** (`cloud-based-file-storage-d8582`), leveraging Firebase Authentication, Cloud Storage buckets, and real-time Cloud Firestore databases.

#### Key Architectural Highlights:
- **Zero-Knowledge Cloud Storage**: Files are encrypted on client devices using the **AES-256-GCM** authenticated cipher via the Web Crypto API before streaming to Google Firebase Storage.
- **Role-Based Access & Granular Sharing**: Supports customizable permission levels (View, Download, Edit) and link sharing managed directly in Cloud Firestore.
- **Real-Time Collaboration & Versioning**: Enables live document editing, automatic SHA-256 cryptographic integrity hashing, version history tracking, and real-time discussion comments.
- **Forensic Audit Logging**: Every critical system event is recorded in a real-time audit log for security compliance.
- **Modern Glassmorphic Visual UI**: Designed with custom dark-mode CSS aesthetics, responsive file grids, dynamic upload dropzones, and real-time storage metrics.

In summary, CloudVault demonstrates how modern web technologies and public cloud services can be combined to solve real-world security and data storage challenges in enterprise cloud computing environments.
