# 📂 mindxInternBackend - Resource Server API

Ứng dụng này là dịch vụ Backend được xây dựng bằng **Spring Boot**. Nó chịu trách nhiệm xử lý các yêu cầu API, giao tiếp với cơ sở dữ liệu và xác thực các **Access Token (JWT)** được gửi từ Frontend.

---

## 🚀 1. Công nghệ và Giám sát

| Công nghệ | Mục đích | Công cụ Giám sát |
| :--- | :--- | :--- |
| **Framework** | Spring Boot 3.x (RESTful APIs) | N/A |
| **Bảo mật** | Spring Security | N/A |
| **Xác thực** | JWT / OIDC (qua MindX IDP) | N/A |
| **Vận hành** | Theo dõi hiệu suất và lỗi | **Azure Application Insights** (Java Agent) |

---

## 🛠️ 2. Hướng dẫn Cài đặt và Chạy Cục bộ (Local Setup)

Để chạy Backend API cục bộ, bạn cần có **Java 17+** và **Maven**.

### 2.1. Thiết lập Biến Môi trường

Tạo file `.env` (hoặc đặt các biến môi trường hệ thống) với các khóa OIDC và CORS sau:

| Khóa | Ví dụ                         | Mục đích                    |
| :--- |:------------------------------|:----------------------------|
| `OPENID_CLIENT_ID` | `mindx-onboarding`            | ID client OIDC.             |
| `OPENID_CLIENT_SECRET` | `your-secret-key`             | Khóa bí mật OIDC.           |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173`       | Cho phép Frontend cục bộ gọi API. |

### 2.2. Khởi động API

1.  **Build dự án (Dùng Maven):**
    ```bash
    mvn clean install -DskipTests
    ```
2.  **Chạy ứng dụng:**
    ```bash
    java -jar target/backend-service.jar
    ```
3.  **Endpoint:** API sẽ chạy tại `http://localhost:8080`.

---

## 📘 3. Tài liệu Chuyên sâu (Docs)

Để biết chi tiết về luồng xác thực, cách triển khai lên Azure và cấu hình giám sát chuyên sâu, vui lòng tham khảo các tài liệu chung của dự án:

* **Tài liệu Dự án Chung (Tổng hợp):** [[Đến Thư mục Docs]](../docs/README.md)
* **Chi tiết Triển khai Azure và Configs:** [[Xem AZURE_DEPLOYMENT]](../docs/04_AZURE_DEPLOYMENT.md)
* **Chi tiết Tích hợp Giám sát:** [[Xem APP_INSIGHTS]](../docs/03_SETUP_APP_INSIGHT.md)