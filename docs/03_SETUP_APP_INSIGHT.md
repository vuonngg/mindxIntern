# ⚙️ HƯỚNG DẪN TÍCH HỢP AZURE APPLICATION INSIGHTS

Tài liệu này mô tả chi tiết cách tích hợp **Azure Application Insights** vào dịch vụ Backend (Spring Boot) để giám sát hiệu suất, sự cố và các yêu cầu (Requests) của API.

---

## 1. 🛠️ CÀI ĐẶT VÀ CẤU HÌNH AZURE APP INSIGHTS

### 1.1. Lấy Connection String

Để kết nối dịch vụ Backend với Azure, bạn cần lấy chuỗi kết nối (Connection String) từ Azure Portal:

1.  **Tạo tài nguyên App Insights:** Trên Azure Portal, tạo một tài nguyên **Application Insights** mới.
2.  **Chọn Vùng:** Chọn vùng phù hợp (ví dụ: Southeast Asia).
3.  **Lấy Chuỗi Kết nối:** Sau khi tạo, truy cập vào tài nguyên và sao chép **Connection String**.

### 1.2. Tích hợp Java Agent

Ứng dụng Spring Boot cần sử dụng **Java Agent** để tự động thu thập telemetry (dữ liệu giám sát) mà không cần thay đổi code:

1.  **Tải Java Agent:** Tải file `applicationinsights-agent-3.x.x.jar` (phiên bản mới nhất) về thư mục dự án.
2.  **Cấu hình trên Azure Web App:** Chuỗi kết nối và đường dẫn Agent được truyền vào Web App thông qua Biến Môi trường (Đã được cấu hình trong **[01_AZURE_DEPLOYMENT.md](./docs/01_AZURE_DEPLOYMENT.md)**):

    * **Tên Biến:** `APPLICATIONINSIGHTS_CONNECTION_STRING`
    * **Cách thức hoạt động:** Azure Web App tự động tải Agent và kích hoạt giám sát khi ứng dụng khởi động.

---

## 2. 📈 CÁC METRIC VÀ CHỈ SỐ VẬN HÀNH CHÍNH

Bảng sau tóm tắt các Metric quan trọng nhất được Application Insights thu thập để đánh giá tình trạng và hiệu suất của Backend API.

<img width="1297" height="691" alt="{6721BFBD-3C51-4FFB-BF40-7A00A2588091}" src="https://github.com/user-attachments/assets/dbf29ec2-3eac-445f-bd48-caa2ec877bc8" />

| Tên Metric / Báo cáo | Ý nghĩa Business | Hình ảnh Minh họa |
| :--- | :--- | :--- |
| **Tỷ lệ Request Thất bại (Failed Requests)** | Tỷ lệ các API Request trả về mã lỗi **4xx** hoặc **5xx**. Chỉ số quan trọng để xác định độ ổn định của dịch vụ. | <img width="444" height="352" alt="image" src="https://github.com/user-attachments/assets/ae20936b-718c-45c7-b201-8c5d4f6b5a79" />|
| **Thời gian Phản hồi (Server Response Time)** | Thời gian trung bình mà Backend cần để xử lý và trả lời một Request API (tính bằng milliseconds). Đánh giá hiệu suất và tốc độ của API. | <img width="451" height="355" alt="image" src="https://github.com/user-attachments/assets/118d5c20-4bf1-4d8c-904b-886960b50510" />|
| **Lượng Server requests** | Lượng Request (tải) mà máy chủ nhận được. Chỉ số này thể hiện mức độ hoạt động và trực tiếp ảnh hưởng đến **tiêu thụ tài nguyên/Bottlenecks** trên Web App. | <img width="461" height="351" alt="image" src="https://github.com/user-attachments/assets/26d7d7d5-ef28-4826-9eb2-63a6e163938c" />|
| **Tính khả dụng (Availability)** | Mức độ mà dịch vụ Backend luôn **sẵn sàng và hoạt động** bình thường. Đây là chỉ số cốt lõi về độ tin cậy của hệ thống. | <img width="408" height="330" alt="{42A6C79E-34C9-4D9E-B4AE-BB06C35400F1}" src="https://github.com/user-attachments/assets/11585bd9-03b4-41da-a7e9-691386812edf" />|

---
## 3. 🚨 THIẾT LẬP CẢNH BÁO (ALERTS)

Các quy tắc cảnh báo (Alert Rules) được thiết lập để thông báo ngay lập tức khi dịch vụ gặp sự cố nghiêm trọng, giúp giảm thời gian chết (Downtime).

| Điều kiện Cảnh báo | Ngưỡng (Threshold) | Tác động |
| :--- | :--- | :--- |
| **Availability Test Failures** (`anoano-anoanobackendai`) | Số lượng **Vị trí Thất bại ≥ 2** (Đã kích hoạt với ngưỡng 2). | **Sự cố Khả dụng Nghiêm trọng:** Dịch vụ Backend bị ngưng hoạt động (Down) ở nhiều khu vực. Cần kiểm tra Web App và Network ngay lập tức. |
| **Server Exceptions** (`isfailRequest`) | **Số lượng Exceptions/count > 0** (Đã kích hoạt với ngưỡng 0). | **Lỗi Logic Backend:** Code Backend đã ném ra lỗi ngoại lệ (Exception), thường là lỗi 500. Cần kiểm tra ngay Logs để tìm lỗi code. |
