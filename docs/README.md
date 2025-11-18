# 📚 Tài liệu Tổng quan Dự án 


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
| **03** | **Setup App Insights** | Hướng dẫn tích hợp Azure Application Insights cho Backend. Chi tiết về Java Agent, `CONNECTION_STRING` và các quy tắc cảnh báo. | [[Mở 03_SETUP_APP_INSIGHT.md]](./03_SETUP_APP_INSIGHT.md) |
