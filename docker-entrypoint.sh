#!/bin/sh
set -eu

api_base_url="${VITE_API_BASE_URL:-https://napi.isoogh.ir}"
escaped_api_base_url=$(printf "%s" "$api_base_url" | sed 's/\\/\\\\/g; s/"/\\"/g')

cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = window.__ENV__ || {};
window.__ENV__.VITE_API_BASE_URL = "$escaped_api_base_url";
EOF
