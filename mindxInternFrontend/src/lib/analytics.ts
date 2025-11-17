import ReactGA from 'react-ga4';

// Get GA tracking ID from environment (runtime or build time)
const getGATrackingId = (): string | null => {
  // @ts-ignore - window.__ENV__ is injected at runtime by docker-entrypoint.sh
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__['VITE_GA_TRACKING_ID']) {
    // @ts-ignore
    return window.__ENV__['VITE_GA_TRACKING_ID'];
  }
  // Fallback to build-time env vars
  return import.meta.env.VITE_GA_TRACKING_ID as string || null;
};

let isInitialized = false;

/**
 * Initialize Google Analytics 4
 * Should be called once when app starts
 */
export const initGA = (): void => {
  const trackingId = getGATrackingId();
  
  if (!trackingId) {
    console.warn('Google Analytics tracking ID not found. Analytics will not be initialized.');
    return;
  }

  if (isInitialized) {
    console.warn('Google Analytics already initialized.');
    return;
  }

  try {
    ReactGA.initialize(trackingId, {
      testMode: import.meta.env.DEV, // Disable in development
    });
    isInitialized = true;
    console.log('Google Analytics initialized with tracking ID:', trackingId);
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

/**
 * Track page view
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!isInitialized) return;
  
  try {
    // react-ga4 uses pageview method
    ReactGA.send({ 
      hitType: 'pageview', 
      page: path, 
      title: title || path 
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

/**
 * Track custom event
 */
export const trackEvent = (params: {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
}): void => {
  if (!isInitialized) return;
  
  try {
    ReactGA.event({
      category: params.category,
      action: params.action,
      label: params.label,
      value: params.value,
      nonInteraction: params.nonInteraction || false,
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

/**
 * Track button click
 */
export const trackButtonClick = (buttonName: string, location?: string): void => {
  trackEvent({
    category: 'Button',
    action: 'Click',
    label: buttonName,
    value: location ? 1 : undefined,
  });
};

/**
 * Track login action
 */
export const trackLogin = (method: string = 'MindX'): void => {
  trackEvent({
    category: 'Authentication',
    action: 'Login',
    label: method,
  });
};

/**
 * Track logout action
 */
export const trackLogout = (): void => {
  trackEvent({
    category: 'Authentication',
    action: 'Logout',
  });
};

/**
 * Track navigation
 */
export const trackNavigation = (from: string, to: string): void => {
  trackEvent({
    category: 'Navigation',
    action: 'Route Change',
    label: `${from} -> ${to}`,
  });
};

