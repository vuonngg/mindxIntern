import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthPage } from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { trackPageView, trackNavigation } from './lib/analytics'

// Component to track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname);
    
    // Track navigation
    if (location.state && (location.state as { from?: Location }).from) {
      const from = (location.state as { from: Location }).from;
      trackNavigation(from?.pathname || '', location.pathname);
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <PageTracker />
      <Routes>
        {/* Public routes */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Login page - redirect to dashboard if already authenticated */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes - Dashboard is the default/main page */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Root path - redirect to dashboard (will be protected) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App
