import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';
import { usePostHogApp } from '../PostHogProvider';

const PremiumContext = createContext(null);

const FEATURE_COPY = {
  youtube_module: {
    title: 'YouTube in Module View',
    description: 'We are sorry, but in-module video embeds use additional bandwidth and processing, so they are reserved for Premium.',
    details: 'Keep your learning flow without leaving the module.'
  },
  cv_export: {
    title: 'Unlimited CV Exports',
    description: 'We are sorry, but unlimited CV exports require extra processing and formatting resources, so they are reserved for Premium.',
    details: 'Premium includes unlimited exports plus additional formats.'
  },
  premium_theme: {
    title: 'Premium Themes',
    description: 'We are sorry, but premium themes require extra design and maintenance resources, so they are reserved for Premium.',
    details: 'Unlock the full theme library.'
  },
  jada_chat: {
    title: 'JADA In-Module Chat',
    description: 'We are sorry, but real-time AI chat uses more resources, so it is reserved for Premium.',
    details: 'Get instant help and explanations in context.'
  },
  analytics: {
    title: 'Advanced Analytics',
    description: 'We are sorry, but advanced analytics require deeper processing, so they are reserved for Premium.',
    details: 'See time spent, velocity, and weak areas.'
  },
  priority_review: {
    title: 'Priority Project Review',
    description: 'We are sorry, but 24-hour project reviews use dedicated reviewer capacity, so they are reserved for Premium.',
    details: 'Premium reviews move to the front of the queue.'
  },
  premium_messaging: {
    title: 'Direct Messaging Premium Users',
    description: 'We are sorry, but unrestricted messaging requires more moderation resources, so it is reserved for Premium.',
    details: 'Connect with top contributors and premium users.'
  },
  progress_dashboard: {
    title: 'Progress Dashboard',
    description: 'We are sorry, but the progress showcase uses additional rendering and analytics, so it is reserved for Premium.',
    details: 'Share a recruiter-ready progress display.'
  },
  general_upgrade: {
    title: 'Premium Upgrade',
    description: 'We are sorry, but premium features require additional resources to deliver, so they are reserved for Premium.',
    details: 'Join the waitlist to unlock when test mode ends.'
  }
};

export const PremiumProvider = ({ children }) => {
  const [status, setStatus] = useState({
    plan_tier: 'FREE',
    is_premium: false,
    waitlist_status: 'none',
    waitlist_joined_at: null,
    cv_exports_remaining: 3
  });
  const [gateState, setGateState] = useState({
    isOpen: false,
    featureKey: 'general_upgrade',
    source: ''
  });
  const [joining, setJoining] = useState(false);
  const { capture, featureFlag } = usePostHogApp();

  /**
   * PostHog feature flag: when 'show-premium-features' is false,
   * the gating modal is hidden (features are ungated).
   */
  const premiumFlagEnabled = featureFlag('show-premium-features');

  const refreshStatus = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await api.get('/api/premium/status/');
      setStatus(res.data);
    } catch (e) {
      console.error('Failed to load premium status');
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const openGate = useCallback((featureKey, source = '') => {
    capture('premium_gate_shown', { feature_key: featureKey || 'general_upgrade', source });
    setGateState({ isOpen: true, featureKey: featureKey || 'general_upgrade', source });
  }, [capture]);

  const closeGate = useCallback(() => {
    setGateState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const joinWaitlist = useCallback(async () => {
    setJoining(true);
    try {
      const res = await api.post('/api/premium/waitlist/', {
        feature_key: gateState.featureKey,
        source: gateState.source
      });
      capture('premium_waitlist_joined', { feature_key: gateState.featureKey, source: gateState.source });
      setStatus(prev => ({
        ...prev,
        waitlist_status: res.data.waitlist_status || 'pending',
        waitlist_joined_at: res.data.waitlist_joined_at || prev.waitlist_joined_at
      }));
    } catch (e) {
      console.error('Failed to join waitlist');
    } finally {
      setJoining(false);
    }
  }, [gateState.featureKey, gateState.source]);

  const checkPremiumAccess = useCallback((featureKey, source = '') => {
    if (status.is_premium) return true;
    // If PostHog flag says premium features are hidden, ungated (allow access)
    if (premiumFlagEnabled === false) return true;
    openGate(featureKey, source);
    return false;
  }, [status.is_premium, premiumFlagEnabled, openGate]);

  const requestCvExport = useCallback(async (source = '') => {
    if (status.is_premium) return { allowed: true };

    try {
      const res = await api.post('/api/premium/cv-export/', { source });
      setStatus(prev => ({
        ...prev,
        cv_exports_remaining: res.data.remaining
      }));
      return { allowed: true, remaining: res.data.remaining };
    } catch (e) {
      openGate('cv_export', source);
      return { allowed: false };
    }
  }, [status.is_premium, openGate]);

  const feature = useMemo(() => FEATURE_COPY[gateState.featureKey] || FEATURE_COPY.general_upgrade, [gateState.featureKey]);

  const value = useMemo(() => ({
    status,
    refreshStatus,
    openGate,
    closeGate,
    joinWaitlist,
    joining,
    feature,
    gateState,
    checkPremiumAccess,
    requestCvExport
  }), [status, refreshStatus, openGate, closeGate, joinWaitlist, joining, feature, gateState, checkPremiumAccess, requestCvExport]);

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};
