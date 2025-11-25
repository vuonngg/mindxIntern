import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthPage } from './view/pages/AuthPage'
import StudentPage from './view/pages/StudentPage'
import AuthCallbackPage from './view/pages/AuthCallbackPage'
import ProtectedRoute from './view/ProtectedRoute'
import PublicRoute from './view/PublicRoute'
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Public routes */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* Login page - redirect to student if already authenticated */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes - Student page is the default/main page */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <StudentPage />
            </ProtectedRoute>
          }
        />
        
        {/* Root path - redirect to student (will be protected) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <StudentPage />
            </ProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to student */}
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


export default App
