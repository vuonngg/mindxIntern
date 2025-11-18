# 📊 HƯỚNG DẪN TÍCH HỢP GOOGLE ANALYTICS 4 (GA4)

Tài liệu này mô tả chi tiết cách tích hợp và cấu hình Google Analytics 4 (GA4) vào ứng dụng Frontend (React/Vite), cùng với danh sách các Metric quan trọng được theo dõi để đánh giá hành vi người dùng.

---

## 1. 🛠️ CÀI ĐẶT VÀ CẤU HÌNH GA4

### 1.1. Lấy Measurement ID (Tracking ID)

Để bắt đầu thu thập dữ liệu, bạn cần tạo một **GA4 Property** và lấy **Measurement ID (G-XXXXXXX)** theo các bước sau:

1.  **Tạo Tài khoản GA4:** Truy cập vào Google Analytics và chọn **Admin (Quản trị)**.
2.  **Tạo Property mới:** Nhấp vào **"Create Property" (Tạo Thuộc tính)**.
3.  **Điền thông tin:** Đặt tên cho Property (Ví dụ: `AnoanoProject`) và chọn múi giờ, đơn vị tiền tệ phù hợp.
4.  **Tạo Data Stream:** Trong Property vừa tạo, chọn **"Data Streams" (Luồng dữ liệu)** và chọn nền tảng **Web**.
5.  **Cấu hình Web Stream:** Nhập **URL** của ứng dụng đã deploy (Ví dụ: `https://anoanofrontend-yyy.azurewebsites.net`) và đặt tên cho luồng.
6.  **Lấy Measurement ID:** Sau khi tạo, bạn sẽ nhận được **Measurement ID** (có định dạng `G-XXXXXXXXXX`). Đây là khóa cần được đưa vào Biến Môi trường.

### 1.2. Tích hợp Tracking ID vào Biến Môi trường

Khóa Tracking ID của GA4 được đặt trong biến môi trường của ứng dụng Frontend (Đã được cấu hình trong **[01_AZURE_DEPLOYMENT.md](./01_AZURE_DEPLOYMENT.md)**):

* **Tên Biến:** `VITE_GA_TRACKING_ID`
* **Vị trí:** Được khởi tạo trong file cấu hình GA4 (`main.tsx`).


---
## 2. 📈 CÁC METRIC VÀ HÀNH VI CHÍNH

Bảng sau tóm tắt các chỉ số quan trọng, mục đích kinh doanh của chúng, và nơi bạn có thể tìm thấy minh họa trực quan.
<img width="1862" height="818" alt="image" src="https://github.com/user-attachments/assets/f1429e30-3482-4b4c-ab79-334c549e86f7" />

| Tên Metric / Báo cáo | Ý nghĩa Business | Hình ảnh Minh họa |
| :--- | :--- | :--- |
| **Số lượng Người dùng (Total/Active Users)** | Đánh giá tổng số lượng **Người dùng thực tế** đang tương tác với ứng dụng. | <img width="492" height="505" alt="image" src="https://github.com/user-attachments/assets/e7c91a4f-ffcf-418e-a02c-3673bf02252e" />|
| **Số lượng Sự kiện (Events Count)** | Tổng số **Hành động** được thực hiện, bao gồm cả các sự kiện tự động và tùy chỉnh </br> </br>  `create, update, delete,`: người dùng thao tác, thêm sửa xóa học sinh trong app</br> `Click`: Số lượt click chuột</br> `scroll`: số lần cuộn trang | <img width="496" height="508" alt="{E2E35F1A-F936-4307-A9AD-E5C0CDB695C9}" src="https://github.com/user-attachments/assets/68f2d733-9306-4122-8688-beccb5e88038" />|
| **Số lần Xem (Page Views)** theo **Tiêu đề trang/Tên màn hình** | Số lần truy cập trang theo tiêu đề và tên màn hình. | <img width="389" height="499" alt="image" src="https://github.com/user-attachments/assets/e3ca3aef-0e61-438e-bc3f-edbaaeafcec8" />|
