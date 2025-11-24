import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './AuthPage'; 
import Dashboard from './Dashboard';
import Profile from './Profile';
import Settings from './Settings';
import Community from './Community';  
import Resources from './Resources';
import MainLayout from './MainLayout';

// Wrapper to check if user is logged in
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Signup />} />
        
        {/* Private Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/community" element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />
        
        <Route path="/resources" element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}