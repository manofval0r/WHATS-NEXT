import axios from 'axios';
import { emitJadaEvent } from './jada/jadaEvents';

// Get API base URL from environment variables or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
console.log("DEBUG: API_BASE_URL is", API_BASE_URL);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 70000, // 70 seconds to accommodate 60s backend timeout + buffer
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token to requests
api.interceptors.request.use((config) => {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  config.__jadaRequestId = requestId;

  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  emitJadaEvent('request:start', {
    id: requestId,
    method: config.method,
    url: config.url,
  });

  return config;
});

// Handle 401 errors by redirecting to login
api.interceptors.response.use(
  (response) => {
    emitJadaEvent('request:end', {
      id: response?.config?.__jadaRequestId,
      ok: true,
      status: response?.status,
      url: response?.config?.url,
    });
    return response;
  },
  (error) => {
    emitJadaEvent('request:end', {
      id: error?.config?.__jadaRequestId,
      ok: false,
      status: error?.response?.status,
      url: error?.config?.url,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

/* ─── Helper functions for new endpoints ─── */

// Roles
export const fetchRoles = () => api.get('/api/roles/');
export const suggestRole = (course, role) =>
  api.post('/api/roles/suggest/', { course, chosen_role: role });

// JADA AI
export const jadaChat = (message, conversationId = null, mode = 'general', moduleId = null, preferredModel = 'auto') =>
  api.post('/api/jada/chat/', { message, conversation_id: conversationId, mode, module_id: moduleId, preferred_model: preferredModel });
export const jadaChatGuest = (message, sessionId, conversationId = null) =>
  axios.post(`${API_BASE_URL}/api/jada/chat/`, {
    message,
    session_id: sessionId,
    conversation_id: conversationId,
    mode: 'consultant',
  }, { headers: { 'Content-Type': 'application/json' }, timeout: 70000 });
export const jadaClaimGuest = (sessionId) =>
  api.post('/api/jada/claim-guest/', { session_id: sessionId });
export const jadaConversations = () => api.get('/api/jada/conversations/');
export const jadaConversationDetail = (id) => api.get(`/api/jada/conversations/${id}/`);
export const jadaSwitchContext = (conversationId, moduleId) =>
  api.patch(`/api/jada/conversations/${conversationId}/context/`, { module_id: moduleId });

// Lesson Progress & Quiz Gates
export const getLessonProgress = (itemId) => api.get(`/api/modules/${itemId}/lesson-progress/`);
export const startLessonQuiz = (itemId, lessonId) =>
  api.post(`/api/modules/${itemId}/lessons/${lessonId}/start-quiz/`);
export const submitLessonQuiz = (itemId, lessonId, answers, timeSpent = 0) =>
  api.post(`/api/modules/${itemId}/lessons/${lessonId}/submit-quiz/`, { answers, time_spent_seconds: timeSpent });
export const updateLessonConfidence = (itemId, lessonId, rating) =>
  api.post(`/api/modules/${itemId}/lessons/${lessonId}/confidence/`, { confidence_rating: rating });

// Social / Following
export const followUser = (userId) => api.post('/api/social/follow/', { user_id: userId });
export const unfollowUser = (userId) => api.post('/api/social/unfollow/', { user_id: userId });
export const getFollowing = () => api.get('/api/social/following/');
export const getFollowers = () => api.get('/api/social/followers/');
export const getFriendsProgress = () => api.get('/api/social/friends-progress/');

// Waitlist
export const joinWaitlist = (email, name, source = 'landing') =>
  api.post('/api/waitlist/', { email, name, source });

// Resource tracking — also fires PostHog event for analytics
export const trackClick = (url, title, moduleId = null) => {
  // Lazy import to avoid circular deps
  import('./posthog').then(({ default: posthog }) => {
    if (posthog?.capture) posthog.capture('resource_clicked', { url, title, module_id: moduleId });
  }).catch(() => {});
  return api.post('/api/track-click/', { url, title, module_id: moduleId });
};