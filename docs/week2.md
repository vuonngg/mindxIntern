# 📊 BÁO CÁO TIẾN ĐỘ TUẦN 2: TÍCH HỢP GIÁM SÁT VÀ ĐO LƯỜNG

**Ngày báo cáo:** 18/11/2025<br/>
**Người thực hiện:** Hoàng Ngọc Vương<br/>
**Dịch vụ liên quan:** Azure App Insights, Google Analytics 4 (GA4)

## 🚀 TÓM TẮT DỰ ÁN

Đây là một ứng dụng web Full-Stack triển khai trên Azure App Services (PaaS), sử dụng React/Vite cho Frontend và Spring Boot cho Backend, với cơ chế xác thực dựa trên **OpenID Connect (OIDC)** thông qua MindX IDP, **và được theo dõi qua Azure Application Insights (Backend) và Google Analytics 4 (Frontend).**


| Thành phần | Công nghệ | Triển khai | Domain Chính Thức | **Công cụ Giám sát ** |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React, Vite | Azure Web App for Containers | `https://anoanofrontend-h3a0gcewdwerbud3.southeastasia-01.azurewebsites.net` | **Google Analytics 4 (GA4)** |
| **Backend** | Spring Boot | Azure Web App for Containers | `https://anoanobackend-ehf8embgehavf8bd.southeastasia-01.azurewebsites.net` | **Azure Application Insights** |
| **Registry** | Azure Container Registry (ACR) | `anoanoweb.azurecr.io` | Nguồn kéo Image cho cả FE và BE. | N/A |
| **Xác thực** | OpenID Connect (OIDC) | MindX IDP | Nguồn xác thực JWT. | N/A |

## ⚙️ 1. CÁC BƯỚC TRIỂN KHAI VÀ ĐÓNG GÓI CONTAINER

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

## 🔑 2. CẤU HÌNH BIẾN MÔI TRƯỜNG VÀ KHÓA BẢO MẬT (TUẦN 2)


### 2.1. Khóa cho Frontend (React/Vite Web App)

| Tên Biến | Giá trị | Giải thích |
| :--- | :--- | :--- |
| **`VITE_GA_TRACKING_ID`** <br/>**`(Bổ sung)`** | `[ID Theo dõi GA4 của bạn]` (Mặc định: `G-LKE75QPRP9`) |  ID Theo dõi Google Analytics 4 để tracking Front-end. |
| `VITE_API_BASE_URL` | `https://anoanobackend-ehf8embgehavf8bd.southeastasia-01.azurewebsites.net` | Địa chỉ công khai của Backend API. |
| `VITE_FRONTEND_REDIRECT_URI` | `https://anoanofrontend-h3a0gcewdwerbud3.southeastasia-01.azurewebsites.net/auth/callback` | URI mà MindX IDP sẽ chuyển hướng về. |
| `VITE_OPENID_CLIENT_ID` | `mindx-onboarding` | ID định danh client OIDC. |


### 2.2. Khóa cho Backend (Spring Boot Web App)

| Tên Biến | Giá trị | Giải thích |
| :--- | :--- | :--- |
| **`APPLICATIONINSIGHTS_CONNECTION_STRING`** <br/>**`(Bổ sung)`**  | `[Connection String của App Insights]` | Chuỗi kết nối cho Azure App Insights. Kích hoạt Java Agent để giám sát vận hành. |
| `OPENID_CLIENT_ID` | `mindx-onboarding` | ID định danh client OIDC. |
| `OPENID_CLIENT_SECRET` | `[Giá trị Khóa Bí Mật Của Bạn]` | Khóa bí mật dùng để Backend trao đổi Code lấy Token. |
| `CORS_ALLOWED_ORIGINS` | `https://anoanofrontend-h3a0gcewdwerbud3.southeastasia-01.azurewebsites.net` | Cho phép Frontend gọi API. |

---

## 3. ✅ TÍCH HỢP GIÁM SÁT VÀ KIỂM TRA DỮ LIỆU 

### 3.1. Azure Application Insights (Backend - Giám sát Vận hành)

* **Tích hợp:** Sử dụng **Application Insights Java Agent** (Giám sát Zero-Code) thông qua cấu hình trong `Dockerfile`.
* **Trạng thái:** Dữ liệu **Server Requests**, **Response Time**, và **Exceptions** đã hiển thị trên Azure Portal.
* **Link Trực tiếp:** [https://portal.azure.com/#@mindx.com.vn/resource/subscriptions/f244cdf7-5150-4b10-b3f2-d4bff23c5f45/resourceGroups/vuonghn-rg/providers/microsoft.insights/components/anoanoBackendAI/overview]
* **Cảnh báo:** Các quy tắc cảnh báo (ví dụ: `isFailRequest`, `Failure Anomalies`) đã được thiết lập.

### 3.2. Google Analytics 4 (Frontend - Giám sát Sản phẩm)

* **Tích hợp:** Sử dụng `VITE_GA_TRACKING_ID` và code JS để gửi dữ liệu từ Frontend.
* **Trạng thái:** Dữ liệu **Page Views**, **User Sessions**, và **Events** (ví dụ: `click`) đã hiển thị trên báo cáo GA4.
* **Link Trực tiếp:** [https://analytics.google.com/analytics/web/#/a355517496p513043431/realtime/overview?params=_u..nav%3Dmaui]

