// Type definition for runtime environment variables injected by docker-entrypoint.sh
interface Window {
  __ENV__?: {
    VITE_API_BASE_URL?: string;
    VITE_FRONTEND_REDIRECT_URI?: string;
    VITE_OPENID_CLIENT_ID?: string;
    VITE_GA_TRACKING_ID?: string;
  };
}

