// d:\working\Web\tro_li_giao_thong_web\tro_li_giao_thong_frontend\scripts\src\dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    // UI Elements for metrics
    const totalReportsEl = document.getElementById('stat-total-reports');
    const pendingReportsEl = document.getElementById('stat-pending-reports');
    const approvedReportsEl = document.getElementById('stat-approved-reports');
    const rejectedReportsEl = document.getElementById('stat-rejected-reports');
    
    const recentTableBody = document.getElementById('recent-reports-body');
    const logoutBtn = document.getElementById('logout-btn');

    // Initialize check
    checkAuthAndLoadData();

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang xử lý...';
                loginError.style.display = 'none';
                
                await window.apiClient.login(username, password);
                
                // Success
                loginModal.style.display = 'none';
                loadDashboardData();
            } catch (error) {
                loginError.textContent = error.message;
                loginError.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Đăng nhập';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.apiClient.clearToken();
            checkAuthAndLoadData();
        });
    }

    function checkAuthAndLoadData() {
        if (!window.apiClient.token) {
            if (loginModal) loginModal.style.display = 'flex';
        } else {
            if (loginModal) loginModal.style.display = 'none';
            loadDashboardData();
        }
    }

    async function loadDashboardData() {
        try {
            // Load Statistics
            const stats = await window.apiClient.getReportStatistics();
            if (stats) {
                // Adjust keys based on backend structure
                if (totalReportsEl) totalReportsEl.textContent = formatNumber(stats.total_reports || 0);
                if (pendingReportsEl) pendingReportsEl.textContent = formatNumber(stats.by_status?.pending || 0);
                if (approvedReportsEl) approvedReportsEl.textContent = formatNumber(stats.by_status?.approved || 0);
                if (rejectedReportsEl) rejectedReportsEl.textContent = formatNumber(stats.by_status?.rejected || 0);
            }

            // Load Recent Reports
            const reportsData = await window.apiClient.getRecentReports();
            if (reportsData && reportsData.pending) {
                renderRecentReports(reportsData.pending);
            }
        } catch (error) {
            console.error("Dashboard loading error:", error);
            if (error.message === 'Unauthorized') {
                checkAuthAndLoadData(); // Show login
            }
        }
    }

    function renderRecentReports(reports) {
        if (!recentTableBody) return;
        
        recentTableBody.innerHTML = '';
        if (reports.length === 0) {
            recentTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Không có báo cáo nào gần đây</td></tr>';
            return;
        }

        reports.slice(0, 5).forEach(report => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'warning';
            let statusText = 'Chờ duyệt';
            if (report.status === 'approved') {
                badgeClass = 'success';
                statusText = 'Đã duyệt';
            } else if (report.status === 'rejected') {
                badgeClass = 'danger';
                statusText = 'Từ chối';
            }

            const date = new Date(report.created_at || Date.now());
            const timeStr = date.toLocaleString('vi-VN', {
                hour: '2-digit', minute:'2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
            });

            const signType = report.detected_sign_type || report.sign_type || 'Biển báo giao thông';

            tr.innerHTML = `
                <td>${signType}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td>${timeStr}</td>
            `;
            recentTableBody.appendChild(tr);
        });
    }

    function formatNumber(num) {
        return new Intl.NumberFormat('vi-VN').format(num);
    }
});
