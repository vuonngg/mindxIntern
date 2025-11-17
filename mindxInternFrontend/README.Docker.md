# Docker Setup cho MindX Intern Frontend

## Cách sử dụng

### 1. Build Docker Image

```bash
docker build -t mindx-intern-frontend .
```

### 2. Chạy Container với Environment Variables

```bash
docker run -d \
  -p 80:80 \
  -e VITE_API_BASE_URL=https://api.example.com \
  -e VITE_FRONTEND_REDIRECT_URI=https://onboarding.mindx.edu.vn/auth/callback \
  -e VITE_OPENID_CLIENT_ID=mindx-onboarding \
  -e VITE_GA_TRACKING_ID=G-LKE75QPRP9 \
  --name mindx-intern-frontend \
  mindx-intern-frontend
```

### 3. Hoặc sử dụng Docker Compose

Chỉnh sửa `docker-compose.yml` hoặc tạo file `.env`:

```bash
# .env
VITE_API_BASE_URL=https://api.example.com
VITE_FRONTEND_REDIRECT_URI=https://onboarding.mindx.edu.vn/auth/callback
VITE_OPENID_CLIENT_ID=mindx-onboarding
```

Sau đó chạy:

```bash
docker-compose up -d
```

## Environment Variables

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `VITE_API_BASE_URL` | URL của backend API. Để trống nếu cùng domain | `https://api.example.com` hoặc `` (empty) |
| `VITE_FRONTEND_REDIRECT_URI` | URI callback cho OAuth. Phải match với URI đã đăng ký | `https://onboarding.mindx.edu.vn/auth/callback` |
| `VITE_OPENID_CLIENT_ID` | Client ID cho OpenID Connect | `mindx-onboarding` |
| `VITE_GA_TRACKING_ID` | Google Analytics 4 Tracking ID | `G-LKE75QPRP9` |

## Trên Azure

Khi deploy lên Azure Container Instances hoặc Azure App Service, truyền environment variables qua:

### Azure Container Instances (ACI)

```bash
az container create \
  --resource-group myResourceGroup \
  --name mindx-frontend \
  --image mindx-intern-frontend:latest \
  --dns-name-label mindx-frontend \
  --ports 80 \
  --environment-variables \
    VITE_API_BASE_URL=https://api.example.com \
    VITE_FRONTEND_REDIRECT_URI=https://onboarding.mindx.edu.vn/auth/callback \
    VITE_OPENID_CLIENT_ID=mindx-onboarding \
    VITE_GA_TRACKING_ID=G-LKE75QPRP9
```

### Azure App Service

Trong Azure Portal:
1. Vào App Service → Configuration → Application settings
2. Thêm các environment variables:
   - `VITE_API_BASE_URL`
   - `VITE_FRONTEND_REDIRECT_URI`
   - `VITE_OPENID_CLIENT_ID`

Hoặc dùng Azure CLI:

```bash
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name myAppService \
  --settings \
    VITE_API_BASE_URL=https://api.example.com \
    VITE_FRONTEND_REDIRECT_URI=https://onboarding.mindx.edu.vn/auth/callback \
    VITE_OPENID_CLIENT_ID=mindx-onboarding \
    VITE_GA_TRACKING_ID=G-LKE75QPRP9
```

## Cách hoạt động

1. **Build time**: Dockerfile build ứng dụng React/Vite (không cần env vars)
2. **Runtime**: `docker-entrypoint.sh` inject environment variables vào HTML dưới dạng `window.__ENV__`
3. **Application**: Code đọc từ `window.__ENV__` (runtime) hoặc `import.meta.env` (fallback)

## Troubleshooting

### Kiểm tra environment variables đã được inject

Mở browser console và gõ:
```javascript
console.log(window.__ENV__)
```

### Xem logs của container

```bash
docker logs mindx-intern-frontend
```

Logs sẽ hiển thị các environment variables đã được inject.

