# 📚 Tài liệu Tổng quan Dự án 

Dự án này là một giải pháp **Full-Stack** được xây dựng nhằm thiết lập và vận hành một luồng ứng dụng hoàn chỉnh trong môi trường đám mây.

Mục tiêu cốt lõi của hệ thống là **Xác thực và Quản lý Định danh** người dùng thông qua giao thức **OpenID Connect (OIDC)**, tích hợp với dịch vụ **MindX IDP**, đồng thời cung cấp các công cụ cần thiết để duy trì độ tin cậy và hiệu suất cao.

---

## 🛠️ Công nghệ Chính (Tech Stack)

| Lớp | Công nghệ | Mục đích |
| :--- | :--- | :--- |
| **Frontend (UI)** | **React.js / Vite** | Giao diện người dùng tương tác. |
| **Backend (API)** | **Spring Boot 3 (Java)** | Cung cấp dịch vụ API bảo mật, xử lý logic nghiệp vụ và luồng OIDC. |
| **Deployment** | **Azure App Service (PaaS) / Docker** | Nền tảng triển khai dịch vụ dưới dạng Container. |
| **Giám sát Frontend** | **Google Analytics 4 (GA4)** | Theo dõi hành vi người dùng và tương tác giao diện. |
| **Giám sát Backend** | **Azure Application Insights** | Giám sát hiệu suất, sự cố, và tính khả dụng của API. |

---
## 1. 🛠️ Cài đặt và Khởi động Cục bộ (Local Development Setup)

* **Backend API:** [[mindxInternBackend/README.md]](../mindxInternBackend/README.md) (Xem các lệnh `mvn` và `java -jar`)
* **Frontend UI:** [[mindxInternFrontend/README.md]](../mindxInternFrontend/README.md) (Xem các lệnh `npm install` và `npm run dev`)

---

## 2. 🚀 Triển khai (Deployment)

Phần này bao gồm toàn bộ quy trình đưa ứng dụng lên Azure Web App for Containers, từ việc tạo hạ tầng đến cấu hình Production.

| ID | Chủ đề | Tóm tắt nội dung | Link Chi tiết |
| :--- | :--- | :--- | :--- |
| **01** | **Azure Deployment Guide** | **Chi tiết quy trình tạo hạ tầng Azure** (ACR, Web App), các bước **Đóng gói/Đẩy Image**, và cấu hình các Biến Môi trường **Production** bắt buộc. | [[Mở 01_AZURE_DEPLOYMENT]](./01_AZURE_DEPLOYMENT.md) |

---

## 3. 📊 Giám sát và Đo lường (Monitoring & Metrics)

Đây là tài liệu chuyên sâu về các công cụ theo dõi hiệu suất hệ thống và hành vi người dùng (Trọng tâm Tuần 2).

| ID | Chủ đề | Tóm tắt nội dung | Link Chi tiết |
| :--- | :--- | :--- | :--- |
| **02** | **Setup GA4** | Hướng dẫn tích hợp Google Analytics 4 cho Frontend. Danh sách các **Events** quan trọng được theo dõi. | [[Mở 02_SETUP_GA4]](./02_SETUP_GA4.md) |
| **03** | **Setup App Insights** | Hướng dẫn tích hợp Azure Application Insights cho Backend. Chi tiết về Java Agent và các quy tắc cảnh báo. | [[Mở 03_SETUP_APP_INSIGHT.md]](./03_SETUP_APP_INSIGHT.md) |
