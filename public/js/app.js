// CloudVault Application Controller with Dynamic Event Delegation
import { CloudVaultFirebase } from './firebase-core.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const App = {
  activeTab: 'dashboard',
  currentUser: null,
  filesCache: [],

  init() {
    window.App = this;
    window.CloudVaultFirebase = CloudVaultFirebase;

    // Attach global click event delegation & change handlers
    this.bindGlobalDelegation();

    // Listen to hash route changes
    window.addEventListener('hashchange', () => this.handleRoute());

    // Listen to Firebase Auth state live
    onAuthStateChanged(CloudVaultFirebase.auth, (user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          role: "Editor",
          quotaBytes: 15 * 1024 * 1024 * 1024
        };
      } else {
        this.currentUser = {
          uid: 'u-sai',
          name: 'sai',
          email: 'sai@cloudvault.io',
          role: 'Editor',
          quotaBytes: 15 * 1024 * 1024 * 1024
        };
      }
      this.handleRoute();
    });
  },

  renderAuth() {
    const hash = window.location.hash || '#login';
    const type = hash === '#register' ? 'register' : 'login';
    document.body.innerHTML = Views.renderAuthScreen(type);

    const authForm = document.getElementById('authForm');
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const errorEl = document.getElementById('authError');
        if (errorEl) errorEl.style.display = 'none';

        try {
          if (type === 'register') {
            const name = document.getElementById('authName').value;
            await CloudVaultFirebase.register(name, email, password);
          } else {
            await CloudVaultFirebase.login(email, password);
          }
          window.location.hash = '#dashboard';
          this.handleRoute();
        } catch (err) {
          if (errorEl) {
            errorEl.textContent = err.message || 'Authentication failed';
            errorEl.style.display = 'block';
          }
        }
      });
    }
  },

  async handleRoute() {
    const hash = (window.location.hash || '#dashboard').replace('#', '');
    if (hash === 'login' || hash === 'register') {
      this.renderAuth();
      return;
    }

    this.activeTab = hash || 'dashboard';

    // Ensure layout structure exists
    if (!document.querySelector('.sidebar')) {
      document.body.innerHTML = Views.renderLayout(
        this.activeTab, 
        '<div style="text-align: center; padding: 40px;"><i class="ri-loader-4-line ri-spin" style="font-size: 32px; color: var(--primary);"></i></div>', 
        this.currentUser || { name: 'sai', role: 'Editor' }
      );
    }

    // Update nav item active states
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-nav') === this.activeTab);
    });

    await this.renderView(this.activeTab);
  },

  async renderView(tab) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    mainContent.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="ri-loader-4-line ri-spin" style="font-size: 32px; color: var(--primary);"></i></div>';

    try {
      if (tab === 'dashboard') {
        const files = await CloudVaultFirebase.getFiles('all');
        this.filesCache = files;
        const totalStorageBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
        const totalDownloads = files.reduce((acc, f) => acc + (f.downloadsCount || 0), 0);
        const analytics = {
          totalFiles: files.length,
          totalStorageBytes,
          totalDownloads
        };
        mainContent.innerHTML = Views.renderDashboard(analytics, files, this.currentUser);
      } else if (tab === 'files') {
        const files = await CloudVaultFirebase.getFiles('mine');
        this.filesCache = files;
        mainContent.innerHTML = `
          <div class="section-title-bar">
            <div class="section-title">My Encrypted Firebase Vault</div>
          </div>
          ${Views.renderFileList(files, this.currentUser)}
        `;
      } else if (tab === 'shared') {
        const files = await CloudVaultFirebase.getFiles('shared');
        this.filesCache = files;
        mainContent.innerHTML = `
          <div class="section-title-bar">
            <div class="section-title">Shared Firebase Assets</div>
          </div>
          ${Views.renderFileList(files, this.currentUser)}
        `;
      } else if (tab === 'audit') {
        const logs = await CloudVaultFirebase.getAuditLogs();
        mainContent.innerHTML = Views.renderAuditLogs(logs);
      }
    } catch (err) {
      console.warn("renderView exception:", err);
      mainContent.innerHTML = Views.renderDashboard(
        { totalFiles: 0, totalStorageBytes: 0, totalDownloads: 0 }, 
        [], 
        this.currentUser
      );
    }
  },

  // Dynamic Event Delegation for all clicks & file selection across the app
  bindGlobalDelegation() {
    // Click Delegation
    document.addEventListener('click', (e) => {
      // 1. Dropzone click -> Trigger file picker
      const dropzone = e.target.closest('#dropzone');
      if (dropzone) {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.click();
        return;
      }

      // 2. Sidebar Nav click
      const navItem = e.target.closest('.nav-item');
      if (navItem) {
        const target = navItem.getAttribute('data-nav');
        if (target) window.location.hash = `#${target}`;
        return;
      }

      // 3. Refresh Button
      if (e.target.closest('#btnRefresh')) {
        this.handleRoute();
        return;
      }

      // 4. Upload Trigger Button
      if (e.target.closest('#btnTriggerUpload')) {
        Views.openModal('uploadModal');
        return;
      }

      // 5. Logout Button
      if (e.target.closest('#btnLogout')) {
        CloudVaultFirebase.logout().then(() => {
          window.location.hash = '#login';
          location.reload();
        });
        return;
      }

      // 6. Modal Close Buttons
      const closeBtn = e.target.closest('.btn-icon[onclick*="closeModal"]');
      if (closeBtn) {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        return;
      }
    });

    // File Input Change Delegation (displays file selection details)
    document.addEventListener('change', (e) => {
      if (e.target && e.target.id === 'fileInput') {
        const fileSelectedName = document.getElementById('fileSelectedName');
        if (fileSelectedName && e.target.files && e.target.files.length) {
          const file = e.target.files[0];
          const sizeKb = (file.size / 1024).toFixed(1);
          fileSelectedName.textContent = `Selected: ${file.name} (${sizeKb} KB)`;
          fileSelectedName.style.display = 'block';
        }
      }
    });

    // Drag and Drop Delegation
    document.addEventListener('dragover', (e) => {
      const dropzone = e.target.closest('#dropzone');
      if (dropzone) {
        e.preventDefault();
        dropzone.classList.add('dragover');
      }
    });

    document.addEventListener('dragleave', (e) => {
      const dropzone = e.target.closest('#dropzone');
      if (dropzone) {
        dropzone.classList.remove('dragover');
      }
    });

    document.addEventListener('drop', (e) => {
      const dropzone = e.target.closest('#dropzone');
      if (dropzone) {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          const fileInput = document.getElementById('fileInput');
          if (fileInput) {
            fileInput.files = e.dataTransfer.files;
            const file = e.dataTransfer.files[0];
            const fileSelectedName = document.getElementById('fileSelectedName');
            if (fileSelectedName) {
              fileSelectedName.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
              fileSelectedName.style.display = 'block';
            }
          }
        }
      }
    });

    // Handle Upload Form Submit
    document.addEventListener('submit', async (e) => {
      if (e.target && e.target.id === 'uploadForm') {
        e.preventDefault();
        const fileInput = document.getElementById('fileInput');
        if (!fileInput || !fileInput.files || !fileInput.files.length) {
          alert('Please click the dropzone box to select a file first.');
          return;
        }

        const btnSubmit = document.getElementById('btnSubmitUpload');
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Encrypting (AES-256) & Uploading...';
        }

        const tagsRaw = document.getElementById('uploadTags')?.value || '';
        const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

        try {
          const uploadedFile = await CloudVaultFirebase.uploadFile(fileInput.files[0], tags, (percent) => {
            if (btnSubmit) btnSubmit.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Encrypting & Pushing (${percent.toFixed(0)}%)...`;
          });

          Views.closeModal('uploadModal');
          e.target.reset();
          const fileSelectedName = document.getElementById('fileSelectedName');
          if (fileSelectedName) fileSelectedName.textContent = '';

          alert(`File '${uploadedFile.name}' encrypted with AES-256-GCM and stored successfully!`);
          await this.handleRoute();
        } catch (err) {
          alert(`Upload error: ${err.message}`);
        } finally {
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<i class="ri-lock-password-line"></i> Encrypt & Upload';
          }
        }
      }
    });
  },

  // Actions
  async downloadFile(fileId) {
    const file = this.filesCache.find(f => f.id === fileId);
    if (!file) return alert('File metadata not found');

    try {
      const blob = await CloudVaultFirebase.downloadAndDecryptFile(file);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Download/Decryption Error: ${err.message}`);
    }
  },

  async openViewer(fileId) {
    const file = this.filesCache.find(f => f.id === fileId);
    if (!file) return;

    document.getElementById('viewerTitle').textContent = file.name;
    document.getElementById('viewerSub').textContent = `SHA-256 Integrity: ${(file.sha256 || '').substring(0, 20)}...`;

    const previewContainer = document.getElementById('filePreviewContent');
    const editorControls = document.getElementById('editorControls');

    try {
      const isText = file.mimeType.includes('text') || file.mimeType.includes('json') || file.mimeType.includes('javascript') || file.mimeType.includes('markdown') || file.name.endsWith('.js') || file.name.endsWith('.md') || file.name.endsWith('.txt');

      if (isText) {
        const textContent = await CloudVaultFirebase.getFileTextContent(file);
        previewContainer.innerHTML = `
          <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">
            <i class="ri-edit-2-line"></i> Collaborative Cloud Editor (Direct Live Versioning):
          </label>
          <textarea id="activeEditorText" class="editor-textarea">${textContent}</textarea>
        `;
        if (editorControls) editorControls.style.display = 'flex';

        const btnSave = document.getElementById('btnSaveContent');
        if (btnSave) {
          btnSave.onclick = async () => {
            const updatedContent = document.getElementById('activeEditorText').value;
            try {
              await CloudVaultFirebase.updateFileTextContent(file, updatedContent, `Saved updates by ${this.currentUser.name}`);
              alert('File updated and new version saved to cloud vault!');
              Views.closeModal('viewerModal');
              this.handleRoute();
            } catch (err) {
              alert(`Error updating file: ${err.message}`);
            }
          };
        }
      } else if (file.mimeType.includes('image')) {
        const blob = await CloudVaultFirebase.downloadAndDecryptFile(file);
        const imgUrl = URL.createObjectURL(blob);
        previewContainer.innerHTML = `<img src="${imgUrl}" style="max-width: 100%; border-radius: 8px; border: 1px solid var(--border-color);" />`;
        if (editorControls) editorControls.style.display = 'none';
      } else {
        previewContainer.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--text-muted);"><i class="ri-file-search-line" style="font-size: 36px;"></i><p style="margin-top: 8px;">Binary File stored on Cloud Vault. Click Download to decrypt locally.</p></div>`;
        if (editorControls) editorControls.style.display = 'none';
      }

      await this.loadComments(fileId);
      Views.openModal('viewerModal');
    } catch (err) {
      alert(`Preview Error: ${err.message}`);
    }
  },

  async loadComments(fileId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    try {
      const comments = await CloudVaultFirebase.getComments(fileId);
      if (!comments || comments.length === 0) {
        commentsList.innerHTML = `<div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 10px;">No cloud comments yet. Start collaborating!</div>`;
      } else {
        commentsList.innerHTML = comments.map(c => `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 10px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; font-weight: 600; color: var(--accent-cyan); margin-bottom: 2px;">
              <span>${c.userName}</span>
              <span style="font-size: 10px; color: var(--text-dim);">${c.timestamp ? Views.formatDate(c.timestamp) : ''}</span>
            </div>
            <div style="color: var(--text-main);">${c.content}</div>
          </div>
        `).join('');
      }

      const commentForm = document.getElementById('commentForm');
      if (commentForm) {
        commentForm.onsubmit = async (e) => {
          e.preventDefault();
          const input = document.getElementById('commentText');
          if (!input || !input.value.trim()) return;

          try {
            await CloudVaultFirebase.addComment(fileId, input.value.trim());
            input.value = '';
            await this.loadComments(fileId);
          } catch (err) {
            alert(err.message);
          }
        };
      }
    } catch (err) {
      commentsList.innerHTML = `<div style="font-size: 12px; color: var(--accent-rose);">Firestore comment error</div>`;
    }
  },

  openShareModal(fileId) {
    const shareFileId = document.getElementById('shareFileId');
    if (shareFileId) shareFileId.value = fileId;
    const shareResultArea = document.getElementById('shareResultArea');
    if (shareResultArea) shareResultArea.style.display = 'none';

    const shareForm = document.getElementById('shareForm');
    if (shareForm) {
      shareForm.onsubmit = async (e) => {
        e.preventDefault();
        const targetEmail = document.getElementById('shareEmail')?.value || '';
        const accessLevel = document.getElementById('shareAccess')?.value || 'download';

        try {
          await CloudVaultFirebase.shareFile(fileId, targetEmail, accessLevel);
          const fullUrl = `${window.location.origin}/#shared`;
          const shareUrlInput = document.getElementById('shareGeneratedUrl');
          if (shareUrlInput) shareUrlInput.value = fullUrl;
          if (shareResultArea) shareResultArea.style.display = 'block';
          alert(`Access permissions updated for user: ${targetEmail}`);
        } catch (err) {
          alert(`Sharing failed: ${err.message}`);
        }
      };
    }

    Views.openModal('shareModal');
  },

  async deleteFile(fileId) {
    const file = this.filesCache.find(f => f.id === fileId);
    if (!file) return;
    if (!confirm(`Are you sure you want to permanently delete '${file.name}'?`)) return;

    try {
      await CloudVaultFirebase.deleteFile(file);
      alert('File deleted permanently.');
      this.handleRoute();
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  }
};

// Initialize App
App.init();
