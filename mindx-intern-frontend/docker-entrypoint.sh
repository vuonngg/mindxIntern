#!/bin/sh

# Script để inject environment variables vào HTML tại runtime
# Thay thế placeholder trong index.html bằng giá trị thực từ environment variables

set -e

# Đọc file index.html
HTML_FILE="/usr/share/nginx/html/index.html"

# Default values nếu không có env vars
VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"
VITE_FRONTEND_REDIRECT_URI="${VITE_FRONTEND_REDIRECT_URI:-http://localhost:5173/auth/callback}"
VITE_OPENID_CLIENT_ID="${VITE_OPENID_CLIENT_ID:-mindx-onboarding}"
VITE_GA_TRACKING_ID="${VITE_GA_TRACKING_ID:-}"

# Escape single quotes và backslashes cho JavaScript string
escape_js_string() {
  echo "$1" | sed "s/'/\\\\'/g" | sed 's/\\/\\\\/g'
}

ESCAPED_API_BASE_URL=$(escape_js_string "$VITE_API_BASE_URL")
ESCAPED_FRONTEND_REDIRECT_URI=$(escape_js_string "$VITE_FRONTEND_REDIRECT_URI")
ESCAPED_OPENID_CLIENT_ID=$(escape_js_string "$VITE_OPENID_CLIENT_ID")
ESCAPED_GA_TRACKING_ID=$(escape_js_string "$VITE_GA_TRACKING_ID")

# Inject env vars vào HTML bằng cách thêm script tag trước </head>
# Script này sẽ set window.__ENV__ với các biến môi trường
if [ -f "$HTML_FILE" ]; then
  # Tạo script tag với env vars (sử dụng single quotes trong JS để tránh conflict)
  ENV_SCRIPT="<script>window.__ENV__={VITE_API_BASE_URL:'$ESCAPED_API_BASE_URL',VITE_FRONTEND_REDIRECT_URI:'$ESCAPED_FRONTEND_REDIRECT_URI',VITE_OPENID_CLIENT_ID:'$ESCAPED_OPENID_CLIENT_ID',VITE_GA_TRACKING_ID:'$ESCAPED_GA_TRACKING_ID'};</script>"
  
  # Insert script trước </head>
  sed -i "s|</head>|$ENV_SCRIPT</head>|" "$HTML_FILE"
  
  echo "Environment variables injected successfully:"
  echo "  - VITE_API_BASE_URL: $VITE_API_BASE_URL"
  echo "  - VITE_FRONTEND_REDIRECT_URI: $VITE_FRONTEND_REDIRECT_URI"
  echo "  - VITE_OPENID_CLIENT_ID: $VITE_OPENID_CLIENT_ID"
  echo "  - VITE_GA_TRACKING_ID: $VITE_GA_TRACKING_ID"
else
  echo "Warning: $HTML_FILE not found"
fi

# Execute CMD
exec "$@"

