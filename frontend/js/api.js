const API_URL = 'https://templatehub-backend-l9yp.onrender.com/api';

const api = {
    getHeaders(isFormData = false) {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (!isFormData) headers['Content-Type'] = 'application/json';
        return headers;
    },

    async handleResponse(res) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Something went wrong');
        return data;
    },

    async login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ email, password })
        });
        return this.handleResponse(res);
    },

    async googleLogin(credential) {
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ credential })
        });
        return this.handleResponse(res);
    },

    async register(name, email, password) {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ name, email, password })
        });
        return this.handleResponse(res);
    },

    async getProfile() {
        const res = await fetch(`${API_URL}/auth/profile`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(res);
    },

    async getTemplates(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_URL}/templates?${query}`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(res);
    },

    async getTemplateById(id) {
        const res = await fetch(`${API_URL}/templates/${id}`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(res);
    },

    async uploadTemplate(formData) {
        const res = await fetch(`${API_URL}/templates`, {
            method: 'POST',
            headers: this.getHeaders(true),
            body: formData
        });
        return this.handleResponse(res);
    },

    async rateTemplate(id, rating) {
        const res = await fetch(`${API_URL}/templates/${id}/rate`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ rating })
        });
        return this.handleResponse(res);
    },

    async downloadTemplate(id) {
        window.location.href = `${API_URL}/templates/${id}/download`;
    },

    async deleteTemplate(id) {
        const res = await fetch(`${API_URL}/templates/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(res);
    },

    async getMyTemplates() {
        const res = await fetch(`${API_URL}/templates/my/templates`, {
            headers: this.getHeaders()
        });
        return this.handleResponse(res);
    }
};

export default api;
