import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type UserData } from '../services/authService';
import { isTokenExpired } from '../services/tokenService';
import { trackEvent } from '../lib/analytics';
import Header from '../components/Header';
import './DashboardPage.css';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First check auth status with backend (backend may use session-based auth)
        const authCheck = await authService.checkAuth();
        
        if (!authCheck.success || (!authCheck.data && !authCheck.user)) {
          navigate('/login', { replace: true });
          return;
        }
        
        // If authenticated, get user details
        const response = await authService.getCurrentUser();
        if (response.success && (response.data || response.user)) {
          const userData = (response.user || response.data) as UserData;
          setUser(userData);
          setError(null);
          
          // Track dashboard view
          trackEvent({
            category: 'Dashboard',
            action: 'View',
            label: 'Dashboard Loaded',
          });
        } else {
          setError('Không thể lấy thông tin người dùng');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể lấy thông tin người dùng');
        // If auth fails, redirect to login
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <Header user={user} />
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Chào mừng trở lại, {user.name || user.email}!</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                📊
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">Tổng số</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                ✅
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">Hoàn thành</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                ⏳
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">Đang xử lý</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                ❌
              </div>
              <div className="stat-content">
                <div className="stat-value">0</div>
                <div className="stat-label">Lỗi</div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>Thống kê chi tiết</h2>
            <div className="dashboard-placeholder">
              <p>Nội dung thống kê sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

