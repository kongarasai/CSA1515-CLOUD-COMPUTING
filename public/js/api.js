// CloudVault Web API Client Module
const API = {
  getToken() {
    return localStorage.getItem('cv_jwt_token');
  },

  setToken(token) {
    if (token) localStorage.setItem('cv_jwt_token', token);
    else localStorage.removeItem('cv_jwt_token');
  },

  getUser() {
    const raw = localStorage.getItem('cv_user');
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user) {
    if (user) localStorage.setItem('cv_user', JSON.stringify(user));
    else localStorage.removeItem('cv_user');
  },

  async request(endpoint, method = 'GET', data = null, isFormData = false) {
    const headers = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData && data) {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      method,
      headers
    };

    if (data) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(endpoint, options);
      const json = await response.json();

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/access')) {
          this.setToken(null);
          this.setUser(null);
          window.location.hash = '#login';
        }
        throw new Error(json.error || 'API Request failed');
      }

      return json;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  },

  // Auth Methods
  login(email, password) {
    return this.request('/api/auth/login', 'POST', { email, password });
  },

  register(name, email, password) {
    return this.request('/api/auth/register', 'POST', { name, email, password });
  },

  getCurrentUser() {
    return this.request('/api/auth/me');
  },

  // File Storage Operations
  getFiles(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/files?${query}`);
  },

  uploadFile(formData) {
    return this.request('/api/files/upload', 'POST', formData, true);
  },

  updateFileContent(fileId, content, note) {
    return this.request(`/api/files/${fileId}/content`, 'PUT', { content, note });
  },

  deleteFile(fileId) {
    return this.request(`/api/files/${fileId}`, 'DELETE');
  },

  // Collaboration & Share
  createShare(fileId, targetUserEmail, accessLevel, password, expiresDays) {
    return this.request('/api/shares', 'POST', { fileId, targetUserEmail, accessLevel, password, expiresDays });
  },

  getComments(fileId) {
    return this.request(`/api/files/${fileId}/comments`);
  },

  addComment(fileId, content) {
    return this.request(`/api/files/${fileId}/comments`, 'POST', { content });
  },

  // Analytics & Audit Logs
  getAnalytics() {
    return this.request('/api/analytics');
  },

  getAuditLogs() {
    return this.request('/api/audit');
  }
};
