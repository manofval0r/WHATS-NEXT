import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import Signup from './AuthPage';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Settings from './Settings';
import Community from './Community';
import Resources from './Resources';
import MainLayout from './MainLayout';
import UserProfile from './UserProfile';
import ActivityLog from './ActivityLog';

import AuthCallback from './AuthCallback';
import Onboarding from './Onboarding';

// Wrapper to check if user is logged in
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
}

// Landing page (redirect to dashboard if already authenticated)
function LandingRoute() {
  const token = localStorage.getItem('access_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Landing />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - Landing Page */}
        <Route path="/" element={<LandingRoute />} />

        {/* Auth Route - Sign up/Login */}
        <Route path="/auth" element={<Signup />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />

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

        <Route path="/u/:username" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />

        <Route path="/profile/activity" element={
          <ProtectedRoute>
            <ActivityLog />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}
