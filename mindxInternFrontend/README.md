# 📂 mindxInternFrontend - React Web Application

Ứng dụng này là giao diện người dùng (User Interface) được xây dựng bằng **React** và **Vite**. Nó chịu trách nhiệm xử lý luồng đăng nhập **OpenID Connect (OIDC)** và tương tác với Backend API để hiển thị dữ liệu.

---

## 🚀 1. Công nghệ và Đo lường

| Công nghệ | Mục đích | Công cụ Đo lường |
| :--- | :--- | :--- |
| **Framework** | React (SPA - Single Page Application) | N/A |
| **Tooling** | Vite, TypeScript | N/A |
| **Styling** | CSS Modules | N/A |
| **Người dùng** | Theo dõi hành vi và tương tác | **Google Analytics 4 (GA4)** |

---

## 🛠️ 2. Hướng dẫn Cài đặt và Chạy Cục bộ (Local Setup)

Để chạy Frontend cục bộ, bạn cần có **Node.js** (phiên bản 18+ được khuyến nghị) và `npm` (hoặc `yarn`).

### 2.1. Thiết lập Biến Môi trường

Tạo file `.env.local` ở thư mục gốc của Frontend với các khóa sau. Các khóa này được sử dụng để cấu hình OIDC và API Endpoint cục bộ.

| Khóa | Ví dụ | Mục đích |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Địa chỉ Backend API cục bộ. |
| `VITE_OPENID_CLIENT_ID` | `mindx-onboarding` | ID định danh client OIDC. |
| `VITE_FRONTEND_REDIRECT_URI` | `http://localhost:5173/auth/callback` | URI chuyển hướng OIDC cục bộ. |

> ℹ️ *Lưu ý: Không cần thiết lập khóa GA4 (`VITE_GA_TRACKING_ID`) cho môi trường cục bộ trừ khi bạn muốn gửi dữ liệu thử nghiệm.*

### 2.2. Khởi động Ứng dụng

1.  **Cài đặt Dependencies:**
    ```bash
    npm install
    ```
2.  **Khởi động Development Server:**
    ```bash
    npm run dev
    ```
3.  **Endpoint:** Ứng dụng sẽ chạy tại `http://localhost:5173`.

---

## 📘 3. Tài liệu Chuyên sâu (Docs)

Để biết chi tiết về các Event được theo dõi trên GA4, luồng xác thực và quy trình triển khai lên Azure, vui lòng tham khảo các tài liệu chung của dự án:

* **Tài liệu Dự án Chung (Tổng hợp):** [[Đến Thư mục Docs]](../docs/README.md)
* **Chi tiết Triển khai Azure và Configs:** [[Xem AZURE_DEPLOYMENT]](../docs/04_AZURE_DEPLOYMENT.md)
* **Chi tiết Tích hợp Đo lường (GA4):** [[Xem SETUP_GA4]](../docs/02_SETUP_GA4.md)