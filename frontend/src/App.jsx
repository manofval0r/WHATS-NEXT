import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import AuthPage from './AuthPage';
import ProfilePageV2 from './ProfilePageV2';

import Dashboard from './Dashboard';
import Onboarding from './Onboarding'; // Added import
import Profile from './Profile';
import Settings from './Settings';
import Community from './Community';
import Leaderboard from './components/community/Leaderboard';
import Resources from './Resources';
import MainLayout from './MainLayout';
import { PremiumProvider } from './premium/PremiumContext';
import UserProfile from './UserProfile';
import ActivityLog from './ActivityLog';
import ErrorBoundary from './components/ErrorBoundary';

import AuthCallback from './AuthCallback';

import { JadaProvider } from './jada/JadaContext';
import JadaOverlay from './jada/JadaOverlay';


// Wrapper to check if user is logged in
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return (
    <PremiumProvider>
      <MainLayout>{children}</MainLayout>
    </PremiumProvider>
  );
}

// Protected but without the sidebar/layout (for onboarding)
function ProtectedBare({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/signup" replace />;
  }
  return children;
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
    <ErrorBoundary>
      <Router>
        <JadaProvider>
          <JadaOverlay />
          <Routes>
          {/* Public Route - Landing Page */}
          <Route path="/" element={<LandingRoute />} />

          {/* Auth Route - Sign up/Login */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<ProtectedBare><Onboarding /></ProtectedBare>} />

          {/* Public Profile Route */}
          <Route path="/u/:username" element={<UserProfile />} />

          {/* Private Routes */}
          <Route path="/roadmap" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePageV2 /></ProtectedRoute>} />
          <Route path="/module/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
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

          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />

          <Route path="/resources" element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } />

          <Route path="/profile/activity" element={
            <ProtectedRoute>
              <ActivityLog />
            </ProtectedRoute>
          } />

        </Routes>
      </JadaProvider>
    </Router>
    </ErrorBoundary>
  );
}
