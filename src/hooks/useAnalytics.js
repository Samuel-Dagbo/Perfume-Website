import { useEffect, useCallback } from 'react';
import api from '../utils/api';

const SESSION_KEY = 'analytics_session_id';

const getSessionId = () => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const trackEvent = async (eventType, data = {}) => {
  try {
    const sessionId = getSessionId();
    
    await api.post('/analytics/event', {
      eventType,
      ...data,
      page: window.location.pathname,
      referrer: document.referrer
    }, {
      headers: {
        'X-Session-Id': sessionId
      },
      timeout: 5000
    });
  } catch (error) {
    console.debug('Analytics tracking failed:', error);
  }
};

export const useAnalytics = () => {
  const track = useCallback((eventType, data = {}) => {
    trackEvent(eventType, data);
  }, []);

  const trackPageView = useCallback((page, metadata = {}) => {
    track('page_view', { page, ...metadata });
  }, [track]);

  const trackProductView = useCallback((productId, metadata = {}) => {
    track('product_view', { productId, ...metadata });
  }, [track]);

  const trackAddToCart = useCallback((productId, metadata = {}) => {
    track('add_to_cart', { productId, ...metadata });
  }, [track]);

  const trackCheckoutStarted = useCallback((metadata = {}) => {
    track('checkout_started', metadata);
  }, [track]);

  const trackOrderCompleted = useCallback((orderId, metadata = {}) => {
    track('order_completed', { orderId, ...metadata });
  }, [track]);

  const trackSearch = useCallback((query, metadata = {}) => {
    track('search', { query, ...metadata });
  }, [track]);

  const trackFilter = useCallback((filters, metadata = {}) => {
    track('filter', { filters, ...metadata });
  }, [track]);

  return {
    track,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackCheckoutStarted,
    trackOrderCompleted,
    trackSearch,
    trackFilter
  };
};

export const usePageTracking = () => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(window.location.pathname, {
      title: document.title,
      url: window.location.href
    });
  }, [trackPageView]);
};

export default useAnalytics;
