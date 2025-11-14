# 📊 BÁO CÁO TIẾN ĐỘ: TRIỂN KHAI ỨNG DỤNG CONTAINER LÊN AZURE

**Ngày báo cáo:** 11/11/2026
**Người thực hiện:** Hoàng Ngọc Vương
**Dịch vụ liên quan:** Azure Web App, Azure Container Registry (ACR), Azure Kubernetes Service (AKS)

## 🚀 TÓM TẮT DỰ ÁN

Đây là một ứng dụng web Full-Stack triển khai trên Azure App Services (PaaS), sử dụng React/Vite cho Frontend và Spring Boot cho Backend, với cơ chế xác thực dựa trên **OpenID Connect (OIDC)** thông qua MindX IDP.

Mục tiêu chính là thiết lập một **Resource Server** ở Backend, nơi bảo vệ các API bằng cách xác thực **Access Token (JWT)** được gửi từ Frontend.

| Thành phần | Công nghệ | Triển khai | Domain Chính Thức (Ví dụ) |
| :--- | :--- | :--- | :--- |
| **Frontend** | React, Vite | Azure Web App for Containers | `https://anoanofrontend-h3a0gcewdwerbud3.southeastasia-01.azurewebsites.net` |
| **Backend** | Spring Boot | Azure Web App for Containers | `https://anoanobackend-ehf8embgehavf8bd.southeastasia-01.azurewebsites.net` |
| **Registry** | Azure Container Registry (ACR) | `anoanoweb.azurecr.io` | Nguồn kéo Image cho cả FE và BE. |
| **Xác thực** | OpenID Connect (OIDC) | MindX IDP | Nguồn xác thực JWT. |

---

## ⚙️ 1. CÁC BƯỚC TRIỂN KHAI VÀ ĐÓNG GÓI CONTAINER

Phần này mô tả trình tự các bước thực hiện trên Azure và Local để thiết lập môi trường PaaS.

### 1.1. Chuẩn bị Hạ tầng Azure

1.  **Tạo Azure Container Registry (ACR):**
    * Tạo một ACR instance (ví dụ: `anoanoweb.azurecr.io`) để lưu trữ Image Docker.
    * Bật **Admin User** để cho phép Azure Web App kéo Image.
2.  **Tạo Azure Web App Backend:**
    * Tạo một **Web App for Containers (Linux)** cho Backend (Spring Boot).
    * Trong tab Docker, chọn **Azure Container Registry** và trỏ đến Image **Backend** (`anoanoweb.azurecr.io/backend-service:latest`).
    * Kích hoạt **Continuous Deployment (CD Hook)** để tự động cập nhật khi Image Backend được đẩy lên ACR.
3.  **Tạo Azure Web App Frontend:**
    * Tạo một **Web App for Containers (Linux)** cho Frontend (React/Vite).
    * Trong tab Docker, chọn **Azure Container Registry** và trỏ đến Image **Frontend** (`anoanoweb.azurecr.io/frontend-app:latest`).
    * Kích hoạt **Continuous Deployment (CD Hook)**.

### 1.2. Đóng gói và Đẩy Image

Thực hiện các lệnh sau trên máy Local để đóng gói và triển khai ứng dụng lên ACR.

1.  **Đăng nhập vào ACR:**
    ```bash
    az acr login --name anoanoweb
    ```
2.  **Đóng gói gắn tag và Đẩy Image Backend:**
    ```bash
    # Đóng gói
    docker build -t anoanoweb.azurecr.io/backend-service:latest -f backend/Dockerfile .
    # Đẩy lên ACR
    docker push anoanoweb.azurecr.io/backend-service:latest
    ```
3.  **Đóng gói và Đẩy Image Frontend:**
    ```bash
    # Đóng gói
    docker build -t anoanoweb.azurecr.io/frontend-app:latest -f frontend/Dockerfile .
    # Đẩy lên ACR
    docker push anoanoweb.azurecr.io/frontend-app:latest
    ```

---

## 🔑 2. CẤU HÌNH BIẾN MÔI TRƯỜNG VÀ KHÓA BẢO MẬT

Sau khi triển khai Container, cần thiết lập các biến môi trường (Environment Variables) trong phần **Configuration** của mỗi Web App để chúng có thể giao tiếp đúng cách.

### 2.1. Khóa cho Frontend (React/Vite Web App)

| Tên Biến | Giá trị | Giải thích |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://anoanobackend-ehf8embgehavf8bd.southeastasia-01.azurewebsites.net` | Địa chỉ **công khai** của Backend API. Frontend sử dụng URL này để gọi API. |
| `VITE_FRONTEND_REDIRECT_URI` | `https://anoanofrontend-h3a0gcewdwerbud3.southeastasia-01.azurewebsites.net/auth/callback` | URI mà MindX IDP sẽ chuyển hướng về sau khi người dùng đăng nhập thành công. |
| `VITE_OPENID_CLIENT_ID` | `mindx-onboarding` | ID định danh client OIDC (đã đăng ký). |

### 2.2. Khóa cho Backend (Spring Boot Web App)

| Tên Biến | Giá trị | Giải thích |
| :--- | :--- | :--- |
| `OPENID_CLIENT_ID` | `mindx-onboarding` | ID định danh client OIDC . |
| `OPENID_CLIENT_SECRET` | `[Giá trị Khóa Bí Mật Của Bạn]` | Khóa bí mật dùng để Backend trao đổi Code lấy Token. |
| `CORS_ALLOWED_ORIGINS` | `https://anoanofrontend-h3a0gcewdwerbud3.southeastasia-01.azurewebsites.net` | Cho phép Frontend (tên miền public) gọi API. |

---

## 🔒 3. LUỒNG XÁC THỰC VÀ VẬN HÀNH (OIDC & JWT)

### 3.1. Luồng Đăng nhập (Authentication)

1.  **Request (FE):** Người dùng chuyển hướng đến MindX IDP với `redirect_uri` (`.../auth/callback`).
2.  **Trao đổi (BE):** MindX IDP trả về Authorization Code. Backend trao đổi Code và Client Secret lấy **Access Token (JWT)**.
3.  **Token Caching (FE):** Backend trả JWT về cho Frontend. Frontend lưu trữ Token để sử dụng cho các API sau này.

### 3.2. Luồng Bảo mật API (Authorization - Resource Server)

1.  **Yêu cầu Kèm Token (FE):** Frontend gửi request API (ví dụ: `/api/data`) và đính kèm JWT vào Header: $$\text{Authorization: Bearer <Access Token>}$$
2.  **Xác minh (BE):** Spring Security Resource Server sử dụng **Issuer URI** của MindX để tự xác minh chữ ký, kiểm tra thời gian hết hạn (`exp`) và nhà phát hành (`iss`) của Token.
3.  **Truy cập:** Nếu Token hợp lệ, request được cấp quyền truy cập.


