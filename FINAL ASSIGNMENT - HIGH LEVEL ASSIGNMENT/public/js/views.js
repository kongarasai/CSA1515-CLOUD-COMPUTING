// CloudVault View Components
const Views = {
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDate(isoStr) {
    const d = new Date(isoStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  },

  renderAuthScreen(type = 'login') {
    const isLogin = type === 'login';
    return `
      <div class="auth-container">
        <div class="auth-card">
          <div class="brand" style="justify-content: center; margin-bottom: 24px;">
            <div class="brand-icon"><i class="ri-cloud-fill"></i></div>
            <div class="brand-name">CloudVault</div>
          </div>
          
          <h2 style="font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 8px;">
            ${isLogin ? 'Sign In to Your Workspace' : 'Create CloudVault Account'}
          </h2>
          <p style="color: var(--text-muted); font-size: 13px; text-align: center; margin-bottom: 24px;">
            ${isLogin ? 'Enter your credentials to access encrypted storage' : 'Deploy your enterprise cloud storage instance'}
          </p>

          <form id="authForm">
            ${!isLogin ? `
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="authName" class="form-control" placeholder="e.g. Alex Rivera" required />
              </div>
            ` : ''}

            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="authEmail" class="form-control" placeholder="user@cloudvault.io" required value="${isLogin ? 'admin@cloudvault.io' : ''}" />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" id="authPassword" class="form-control" placeholder="••••••••" required value="${isLogin ? 'admin123' : ''}" />
            </div>

            <div id="authError" style="color: var(--accent-rose); font-size: 13px; margin-bottom: 16px; display: none;"></div>

            <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; padding: 12px;">
              ${isLogin ? '<i class="ri-login-box-line"></i> Secure Sign In' : '<i class="ri-user-add-line"></i> Register Account'}
            </button>
          </form>

          <div style="margin-top: 20px; text-align: center; font-size: 13px; color: var(--text-muted);">
            ${isLogin ? 
              `Don't have an account? <a href="#register" style="color: var(--primary); text-decoration: none; font-weight: 600;">Register Now</a>` : 
              `Already registered? <a href="#login" style="color: var(--primary); text-decoration: none; font-weight: 600;">Sign In</a>`
            }
          </div>

          ${isLogin ? `
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-dim); text-align: center;">
              <strong>Demo Accounts:</strong><br/>
              Admin: <code>admin@cloudvault.io</code> / <code>admin123</code><br/>
              Editor: <code>sarah@cloudvault.io</code> / <code>user123</code>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderLayout(activeTab, contentHtml, user) {
    return `
      <div id="app">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
          <div>
            <div class="brand">
              <div class="brand-icon"><i class="ri-cloud-fill"></i></div>
              <div class="brand-name">CloudVault</div>
            </div>

            <ul class="nav-menu">
              <li class="nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
                <i class="ri-dashboard-3-line"></i> Dashboard
              </li>
              <li class="nav-item ${activeTab === 'files' ? 'active' : ''}" data-nav="files">
                <i class="ri-folder-keyhole-line"></i> My Encrypted Files
              </li>
              <li class="nav-item ${activeTab === 'shared' ? 'active' : ''}" data-nav="shared">
                <i class="ri-share-line"></i> Shared Collaboration
              </li>
              <li class="nav-item ${activeTab === 'audit' ? 'active' : ''}" data-nav="audit">
                <i class="ri-shield-keyhole-line"></i> Security Audit Logs
              </li>
            </ul>
          </div>

          <div class="user-profile-widget">
            <div class="avatar">${user.name.charAt(0)}</div>
            <div class="user-details">
              <div class="user-name">${user.name}</div>
              <div class="user-role">${user.role}</div>
            </div>
            <button class="btn-logout" id="btnLogout" title="Sign Out"><i class="ri-logout-box-r-line"></i></button>
          </div>
        </aside>

        <!-- Main Workspace -->
        <main class="main-wrapper">
          <header class="top-bar">
            <div class="search-box">
              <i class="ri-search-line"></i>
              <input type="text" id="searchInput" placeholder="Search files, tags, or encrypted objects..." />
            </div>

            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 6px 12px; border-radius: 20px; font-weight: 600;">
              <i class="ri-google-fill"></i> Firebase Cloud Connected
            </div>

            <div class="header-actions">
              <button class="btn btn-secondary" id="btnRefresh"><i class="ri-refresh-line"></i> Refresh</button>
              <button class="btn btn-primary" id="btnTriggerUpload"><i class="ri-upload-cloud-2-line"></i> Upload Encrypted File</button>
            </div>
          </header>

          <div class="content-body" id="mainContent">
            ${contentHtml}
          </div>
        </main>
      </div>

      <!-- Upload Modal -->
      <div class="modal-overlay" id="uploadModal">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title"><i class="ri-upload-cloud-fill" style="color: var(--primary);"></i> Upload & Encrypt Object</div>
            <button class="btn-icon" onclick="Views.closeModal('uploadModal')"><i class="ri-close-line"></i></button>
          </div>
          <form id="uploadForm">
            <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()" style="cursor: pointer;">
              <i class="ri-file-upload-line dropzone-icon"></i>
              <div class="dropzone-text">Drag & Drop files here or click to browse</div>
              <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">AES-256-GCM cipher encryption will be applied automatically</div>
            </div>
            <input type="file" id="fileInput" class="file-input" style="display: none;" />
            <div id="fileSelectedName" style="margin-top: 10px; font-size: 13px; color: var(--accent-cyan); font-weight: 600;"></div>
            <div class="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" id="uploadTags" class="form-control" placeholder="e.g. Architecture, Confidential, Security" />
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary" onclick="Views.closeModal('uploadModal')">Cancel</button>
              <button type="submit" class="btn btn-primary" id="btnSubmitUpload"><i class="ri-lock-password-line"></i> Encrypt & Upload</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Viewer / Editor Modal -->
      <div class="modal-overlay" id="viewerModal">
        <div class="modal-card" style="max-width: 900px; width: 95%;">
          <div class="modal-header">
            <div>
              <div class="modal-title" id="viewerTitle">File Preview & Collaboration</div>
              <div style="font-size: 12px; color: var(--text-muted);" id="viewerSub"></div>
            </div>
            <button class="btn-icon" onclick="Views.closeModal('viewerModal')"><i class="ri-close-line"></i></button>
          </div>
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;" id="viewerBodyContainer">
            <!-- Left: Document View/Edit Area -->
            <div>
              <div id="filePreviewContent" style="margin-bottom: 16px;"></div>
              <div id="editorControls" style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="btn btn-primary" id="btnSaveContent"><i class="ri-save-3-line"></i> Save & Push Version</button>
              </div>
            </div>

            <!-- Right: Comments & Versioning Sidebar -->
            <div style="border-left: 1px solid var(--border-color); padding-left: 16px;">
              <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;"><i class="ri-chat-3-line"></i> Collaborative Comments</h4>
              <div id="commentsList" style="max-height: 250px; overflow-y: auto; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px;"></div>
              <form id="commentForm" style="display: flex; flex-direction: column; gap: 8px;">
                <textarea id="commentText" class="form-control" style="height: 60px; font-size: 12px;" placeholder="Add comment..." required></textarea>
                <button type="submit" class="btn btn-secondary" style="font-size: 12px; padding: 6px 12px;"><i class="ri-send-plane-fill"></i> Post Comment</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Share Link Modal -->
      <div class="modal-overlay" id="shareModal">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title"><i class="ri-share-forward-line" style="color: var(--accent-cyan);"></i> Share Encrypted Asset</div>
            <button class="btn-icon" onclick="Views.closeModal('shareModal')"><i class="ri-close-line"></i></button>
          </div>
          <form id="shareForm">
            <input type="hidden" id="shareFileId" />
            <div class="form-group">
              <label>Target User Email (Optional for direct share)</label>
              <input type="email" id="shareEmail" class="form-control" placeholder="colleague@cloudvault.io" />
            </div>
            <div class="form-group">
              <label>Access Permission Level</label>
              <select id="shareAccess" class="form-control">
                <option value="view">View & Preview Only</option>
                <option value="download" selected>Download Allowed</option>
                <option value="edit">Full Edit & Version Control</option>
              </select>
            </div>
            <div class="form-group">
              <label>Protection Password (Optional)</label>
              <input type="password" id="sharePassword" class="form-control" placeholder="Leave blank for open link" />
            </div>
            <div class="form-group">
              <label>Link Expiration (Days)</label>
              <input type="number" id="shareExpires" class="form-control" value="7" min="1" max="30" />
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-secondary" onclick="Views.closeModal('shareModal')">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="ri-link"></i> Generate Secure Link</button>
            </div>
          </form>
          <div id="shareResultArea" style="margin-top: 16px; display: none;">
            <div style="font-size: 13px; color: var(--accent-emerald); font-weight: 600; margin-bottom: 6px;">Share Link Generated:</div>
            <input type="text" id="shareGeneratedUrl" class="form-control" readonly style="font-family: 'JetBrains Mono', monospace; font-size: 12px;" />
          </div>
        </div>
      </div>
    `;
  },

  renderDashboard(analytics, files, user) {
    const quotaBytes = user.quotaBytes || 15 * 1024 * 1024 * 1024;
    const usedBytes = analytics.totalStorageBytes || 0;
    const percentage = Math.min(100, ((usedBytes / quotaBytes) * 100).toFixed(1));

    return `
      <!-- Stats Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon indigo"><i class="ri-file-lock-line"></i></div>
          <div class="stat-info">
            <div class="value">${analytics.totalFiles || 0}</div>
            <div class="label">Total Encrypted Files</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon cyan"><i class="ri-hard-drive-2-line"></i></div>
          <div class="stat-info">
            <div class="value">${this.formatBytes(usedBytes)}</div>
            <div class="label">Storage Consumption</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon emerald"><i class="ri-download-cloud-2-line"></i></div>
          <div class="stat-info">
            <div class="value">${analytics.totalDownloads || 0}</div>
            <div class="label">Cloud Downloads</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon amber"><i class="ri-shield-check-line"></i></div>
          <div class="stat-info">
            <div class="value">AES-256</div>
            <div class="label">Encryption Standard</div>
          </div>
        </div>
      </div>

      <!-- Storage Quota Bar -->
      <div class="storage-bar-wrapper">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600;">
          <span><i class="ri-pie-chart-2-line" style="color: var(--accent-cyan);"></i> Enterprise Cloud Storage Utilization</span>
          <span>${this.formatBytes(usedBytes)} / ${this.formatBytes(quotaBytes)} (${percentage}%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${percentage}%;"></div>
        </div>
      </div>

      <!-- File Drop Area Trigger -->
      <div class="upload-dropzone" onclick="Views.openModal('uploadModal')">
        <i class="ri-cloud-upload-line upload-icon"></i>
        <h3 style="font-size: 16px; font-weight: 700; color: #fff;">Upload File to Encrypted Vault</h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Click here or drag files to trigger automatic AES-256 payload encryption & Web API push</p>
      </div>

      <!-- Recent Files Section -->
      <div class="section-title-bar">
        <div class="section-title">Recent Workspace Files</div>
        <a href="#files" style="color: var(--primary); font-size: 13px; text-decoration: none; font-weight: 600;">View All Files →</a>
      </div>

      ${this.renderFileList(files.slice(0, 6), user)}
    `;
  },

  renderFileList(files, user) {
    if (!files || files.length === 0) {
      return `
        <div style="text-align: center; padding: 48px; background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); color: var(--text-muted);">
          <i class="ri-inbox-archive-line" style="font-size: 40px; color: var(--text-dim);"></i>
          <p style="margin-top: 8px;">No encrypted files found in this view.</p>
        </div>
      `;
    }

    return `
      <div class="file-grid">
        ${files.map(file => {
          const isOwner = file.ownerId === user.id;
          let iconClass = 'ri-file-text-line';
          if (file.mimeType.includes('image')) iconClass = 'ri-image-line';
          else if (file.mimeType.includes('pdf')) iconClass = 'ri-file-pdf-2-line';
          else if (file.mimeType.includes('javascript') || file.mimeType.includes('code') || file.name.endsWith('.js') || file.name.endsWith('.py')) iconClass = 'ri-code-s-slash-line';
          else if (file.mimeType.includes('markdown')) iconClass = 'ri-markdown-line';

          return `
            <div class="file-card" data-id="${file.id}">
              <div class="file-card-header">
                <div class="file-type-icon"><i class="${iconClass}"></i></div>
                <div class="file-meta-main">
                  <div class="file-title" title="${file.name}">${file.name}</div>
                  <div class="file-subtitle">${this.formatBytes(file.size)} • ${this.formatDate(file.createdAt)}</div>
                  <div>
                    ${(file.tags || []).map(t => `<span class="tag-badge">${t}</span>`).join('')}
                  </div>
                </div>
              </div>

              <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">
                <i class="ri-user-line"></i> ${file.ownerName || 'Owner'} ${file.isShared ? '• <span style="color: var(--accent-cyan);"><i class="ri-share-line"></i> Shared</span>' : ''}
              </div>

              <div class="file-card-footer">
                <div style="display: flex; gap: 6px;">
                  <button class="btn-icon" title="Preview / Collaborate" onclick="App.openViewer('${file.id}')"><i class="ri-eye-line"></i></button>
                  <button class="btn-icon" title="Download Decrypted" onclick="App.downloadFile('${file.id}')"><i class="ri-download-2-line"></i></button>
                  <button class="btn-icon" title="Share Asset" onclick="App.openShareModal('${file.id}')"><i class="ri-share-forward-line"></i></button>
                </div>
                ${(isOwner || user.role === 'Admin') ? `
                  <button class="btn-icon danger" title="Delete Object" onclick="App.deleteFile('${file.id}')"><i class="ri-delete-bin-line"></i></button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  renderAuditLogs(logs) {
    return `
      <div class="section-title-bar">
        <div class="section-title"><i class="ri-shield-keyhole-line" style="color: var(--accent-emerald);"></i> Security Audit Forensic Trail</div>
      </div>
      <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden;">
        <table class="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Details & Payload</th>
              <th>IP Origin</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td style="color: var(--text-muted);">${this.formatDate(log.timestamp)}</td>
                <td style="font-weight: 600;">${log.userEmail}</td>
                <td><span class="badge-action">${log.action}</span></td>
                <td>${log.details}</td>
                <td style="font-family: 'JetBrains Mono', monospace; color: var(--text-dim);">${log.ip}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }
};

window.Views = Views;
