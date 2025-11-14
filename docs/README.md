# 📊 BÁO CÁO TIẾN ĐỘ: TRIỂN KHAI ỨNG DỤNG CONTAINER LÊN AZURE

**Ngày báo cáo:** 11/11/2026
**Người thực hiện:** Hoàng Ngọc Vương
**Dịch vụ liên quan:** Azure Web App, Azure Container Registry (ACR), Azure Kubernetes Service (AKS)

## 1. TÓM TẮT HIỆN TRẠNG (EXECUTIVE SUMMARY)

Ứng dụng web Node.js/Express đã được đóng gói thành công dưới dạng Docker Container và triển khai lên môi trường Cloud Azure. Tiến độ đã đạt được mục tiêu quan trọng là thiết lập quy trình **Triển khai Liên tục (Continuous Deployment – CD)**.

* **Trạng thái Triển khai Chính:** **HOÀN THÀNH**. Ứng dụng đã được triển khai và hoạt động trên **Azure Web App for Containers (PaaS)** và **Azure Kubernetes Service (AKS)**.
* **Thành quả Chính:** Hệ thống tự động cập nhật code mới bằng việc thay thế Container Image ngay sau khi lệnh `docker push` được thực hiện.
* **Các Bước Tiếp Theo:** Gắn tên miền riêng và chứng chỉ bảo mật HTTPS **chưa thể triển khai** (đang gặp lỗi kỹ thuật trong quá trình chuyển sang AKS/Cert-Manager).

---

## 2. CHI TIẾT CÁC BƯỚC TRIỂN KHAI

### 2.1. Đóng gói và Lưu trữ Container (Dockerization)

| Hạng mục | Chi tiết | Vai trò |
| :--- | :--- | :--- |
| **Dockerfile** | Đã sử dụng Dockerfile để đóng gói ứng dụng Node.js/Express thành Image. | Đảm bảo môi trường runtime nhất quán, độc lập với hệ thống. |
| **Image Registry** | Azure Container Registry (ACR): `anoanoweb.azurecr.io` | Nơi lưu trữ an toàn Image Docker của ứng dụng, là nguồn kéo Image của các dịch vụ Azure. |
| **Thao tác Push** | Đã thực hiện `docker build`, `docker tag`, và `docker push` thành công lên ACR. | Cập nhật phiên bản `:latest` trên kho lưu trữ, sẵn sàng cho việc triển khai tự động. |

### 2.2. Triển khai Lên Azure Web App (PaaS)

| Dịch vụ | Cấu hình | Mục đích |
| :--- | :--- | :--- |
| **Web App** | Web App for Containers (Linux) | Nền tảng PaaS (Platform as a Service) để chạy Container, giảm thiểu quản lý hạ tầng máy chủ. |
| **App Service Plan (ASP)** | Tên ASP của bạn: `[Tên ASP của bạn]` | Cung cấp tài nguyên CPU/RAM/Storage chuyên dụng cho Web App. |
| **Image Source** | Azure Container Registry (`anoanoWeb`) | Chỉ định Web App kéo Image mới nhất từ ACR về để chạy. |
| **CD Hook** | Đã kích hoạt Continuous Deployment | Cho phép Web App tự động khởi động lại và kéo Image mới sau mỗi lần `docker push` lên ACR. |

### 2.3. Triển khai Lên Azure Kubernetes Service (AKS)

| Hạng mục | Chi tiết | Mục đích |
| :--- | :--- | :--- |
| **AKS Cluster** | Đã Provision Cluster và cấu hình `kubectl` access. | Chuẩn bị nền tảng điều phối (orchestration) cho kiến trúc Full-Stack trong các bước tiếp theo. |
| **Kubernetes Manifests** | Đã tạo các file **Deployment** và **Service** YAML. | Định nghĩa số lượng Pods, chiến lược Rollout và cách thức lộ ra ngoài (Exposure) của ứng dụng. |
| **Ingress Controller** | Đã cài đặt Nginx Ingress Controller. | Xử lý việc định tuyến lưu lượng truy cập (traffic) từ bên ngoài vào các Service bên trong AKS. |
| **Triển khai Code** | Đã triển khai Pods và Service thành công, kéo Image từ ACR. | Xác nhận ứng dụng đã chạy được trên môi trường Kubernetes. |

---

## 3. KẾT LUẬN VÀ KIỂM TRA

### ✅ Trạng thái Ứng dụng

| Nền tảng | Trạng thái | Link Truy cập (Mặc định)                                                                                             | Ghi chú                                                                                         |
| :--- | :--- |:---------------------------------------------------------------------------------------------------------------------|:------------------------------------------------------------------------------------------------|
| **Web App (PaaS)** | **Hoạt động** | https://anoanowebcontainer-fsbxdnazezbdehdj.southeastasia-01.azurewebsites.net                                       | Hoạt động qua SSL mặc định của Azure.                                                           |
| **AKS (Orchestration)** | **Hoạt động** | frontend: **http://vuonghn.mindx.com.vn** <br/>Api backend test: **http://api.vuonghn.mindx.com.vn/api/auth/health** | - Hoạt động qua Tên miền HTTP (đang kẹt ở HTTPS)<br/> - Frontend chưa kết nối được với backend. |

### ❌ Các Hạn chế Hiện tại (Mục tiêu chưa đạt được)

1.  **Cấu hình Tên miền Riêng (Custom Domain):** Cần hoàn tất việc liên kết tên miền riêng cho cả hai nền tảng hoặc chuyển hoàn toàn sang sử dụng tên miền thông qua Ingress của AKS.
2.  **Triển khai HTTPS cho Tên miền Riêng:** Đây là bước bị kẹt. **Cert-Manager** đang thất bại trong việc cấp phát chứng chỉ Let's Encrypt do lỗi định tuyến Challenge trong Nginx Ingress.