const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Fallback Upload API Endpoint
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const fileName = `${Date.now()}_${req.file.originalname}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, req.file.buffer);

  const downloadURL = `/uploads/${fileName}`;
  res.json({
    success: true,
    fileName: req.file.originalname,
    storagePath: `uploads/${fileName}`,
    downloadURL: `/api/files/download/${fileName}`,
    size: req.file.size
  });
});

// Download API Endpoint
app.get('/api/files/download/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.sendFile(filePath);
});

// Firebase & System Health Endpoint
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
  console.log(`=====================================================================`);
  console.log(` CloudVault - Secure Cloud Storage & Firebase Collaboration Server   `);
  console.log(` Active Project: cloud-based-file-storage-d8582                      `);
  console.log(` Server Listening at: http://localhost:${PORT}                       `);
  console.log(`=====================================================================`);
});
