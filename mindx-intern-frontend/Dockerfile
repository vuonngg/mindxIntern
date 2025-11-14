# ----------------------------------------------------
# GIAI ĐOẠN 1: BUILD (Sử dụng Node để build ứng dụng Vite/React)
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Sao chép và cài đặt các phụ thuộc
COPY package.json package-lock.json ./
RUN npm install --silent

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng (không cần env vars ở build time vì sẽ inject ở runtime)
RUN npm run build

# ----------------------------------------------------
# GIAI ĐOẠN 2: PRODUCTION (Runtime - Image cuối cùng)
# ----------------------------------------------------
# Sử dụng Nginx nhẹ để phục vụ các file tĩnh
FROM nginx:stable-alpine

# Sao chép file cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép các file tĩnh đã được build (thư mục 'dist')
COPY --from=builder /app/dist /usr/share/nginx/html

# Sao chép script để inject environment variables
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port mặc định của Nginx
EXPOSE 80

# Sử dụng entrypoint script để inject env vars trước khi start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
