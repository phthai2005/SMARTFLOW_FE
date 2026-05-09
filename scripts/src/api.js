// d:\working\Web\tro_li_giao_thong_web\tro_li_giao_thong_frontend\scripts\src\api.js
const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn('Backend login failed, using demo mode', errorData);
                // Fallback for demo if backend is empty
                this.setToken('demo_token');
                return { access_token: 'demo_token' };
            }

            const data = await response.json();
            this.setToken(data.access_token);
            return data;
        } catch (error) {
            console.error('Login error, using demo mode:', error);
            this.setToken('demo_token');
            return { access_token: 'demo_token' };
        }
    }

    async getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    async getReportStatistics(days = 30) {
        try {
            const response = await fetch(`${API_BASE_URL}/statistics/reports?days=${days}`, {
                method: 'GET',
                headers: await this.getHeaders()
            });

            if (response.status === 401) {
                this.clearToken();
                throw new Error('Unauthorized');
            }

            if (!response.ok) throw new Error('Failed to fetch statistics');
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.warn('Backend statistics fetch failed, using mock data:', error);
            return {
                total_reports: 1284,
                by_status: {
                    pending: 42,
                    approved: 1156,
                    rejected: 86
                }
            };
        }
    }

    async getRecentReports() {
        try {
            // Using crowdsourcing pending reports API endpoint
            const response = await fetch(`${API_BASE_URL}/crowdsourcing/reports?limit=5`, {
                method: 'GET',
                headers: await this.getHeaders()
            });

            if (response.status === 401) {
                this.clearToken();
                throw new Error('Unauthorized');
            }
            if (response.status === 403) {
                 throw new Error('Forbidden - requires admin');
            }

            if (!response.ok) throw new Error('Failed to fetch recent reports');
            return await response.json();
        } catch (error) {
            console.warn('Backend recent reports fetch failed, using mock data:', error);
            return {
                pending: [
                    { sign_type: "Đi ngược chiều", status: "approved", created_at: new Date(Date.now() - 2*60000).toISOString() },
                    { sign_type: "Vượt đèn đỏ", status: "pending", created_at: new Date(Date.now() - 15*60000).toISOString() },
                    { sign_type: "Sai làn đường", status: "rejected", created_at: new Date(Date.now() - 60*60000).toISOString() },
                    { sign_type: "Đỗ xe sai quy định", status: "approved", created_at: new Date(Date.now() - 180*60000).toISOString() },
                    { sign_type: "Không đội mũ bảo hiểm", status: "approved", created_at: new Date(Date.now() - 300*60000).toISOString() }
                ]
            };
        }
    }
}

// Global instance
window.apiClient = new ApiClient();
