# Hướng dẫn chạy ứng dụng với Application Insights Java Agent

## 📋 Yêu cầu

1. **Connection String từ Azure Portal**
   - Vào Azure Portal → Application Insights resource
   - Copy **Connection String** (format: `InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/`)

2. **Java 17+** (nếu chạy local)
3. **Maven 3.6+** (nếu chạy local)
4. **Docker** (nếu chạy bằng Docker)

---

## 🚀 Cách 1: Chạy Local (Development)

### Bước 1: Set Environment Variable

**Windows PowerShell:**
```powershell
$env:APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
```

**Windows CMD:**
```cmd
set APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/
```

**Linux/Mac:**
```bash
export APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
```

### Bước 2: Download Application Insights Agent

```bash
# Tạo thư mục agents
mkdir -p agents

# Download agent (version 3.4.19)
# Windows PowerShell:
Invoke-WebRequest -Uri "https://github.com/microsoft/ApplicationInsights-Java/releases/download/3.4.19/applicationinsights-agent-3.4.19.jar" -OutFile "agents/applicationinsights-agent.jar"

# Linux/Mac:
wget -O agents/applicationinsights-agent.jar https://github.com/microsoft/ApplicationInsights-Java/releases/download/3.4.19/applicationinsights-agent-3.4.19.jar
```

### Bước 3: Build ứng dụng

```bash
mvn clean package
```

### Bước 4: Chạy với Java Agent

```bash
# Windows
java -javaagent:agents/applicationinsights-agent.jar -jar target/mindxInternBackend-0.0.1-SNAPSHOT.jar

# Linux/Mac
java -javaagent:agents/applicationinsights-agent.jar -jar target/mindxInternBackend-0.0.1-SNAPSHOT.jar
```

**Hoặc chạy trực tiếp với Maven:**
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-javaagent:agents/applicationinsights-agent.jar"
```

### Bước 5: Verify

1. **Kiểm tra logs:**
   ```
   [Application Insights] Agent is running
   [Application Insights] Connection string configured
   ```

2. **Test API:**
   ```bash
   curl http://localhost:8080/api/auth/health
   ```

3. **Kiểm tra Azure Portal** (sau 2-5 phút):
   - Vào Application Insights resource
   - Xem **Live Metrics** hoặc **Application map**

---

## 🐳 Cách 2: Chạy với Docker

### Bước 1: Set Environment Variable (trước khi build)

**Windows PowerShell:**
```powershell
$env:APPLICATIONINSIGHTS_CONNECTION_STRING = "InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
```

**Linux/Mac:**
```bash
export APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
```

### Bước 2: Build Docker Image

```bash
docker build -t mindx-backend:latest .
```

**Lưu ý:** Dockerfile đã tự động download Application Insights Agent, không cần làm gì thêm.

### Bước 3: Chạy Container

```bash
docker run -p 8080:8080 \
  -e APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/" \
  mindx-backend:latest
```

**Hoặc sử dụng file `.env`:**
```bash
# Tạo file .env
echo "APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/" > .env

# Chạy với .env
docker run -p 8080:8080 --env-file .env mindx-backend:latest
```

### Bước 4: Verify

1. **Kiểm tra logs:**
   ```bash
   docker logs <container-id>
   ```
   
   Tìm dòng:
   ```
   [Application Insights] Agent is running
   ```

2. **Test API:**
   ```bash
   curl http://localhost:8080/api/auth/health
   ```

---

## ☸️ Cách 3: Deploy lên Kubernetes

### Bước 1: Tạo Secret với Connection String

```bash
kubectl create secret generic app-insights-secret \
  --from-literal=APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
```

**Hoặc tạo file `app-insights-secret.yml`:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-insights-secret
type: Opaque
stringData:
  APPLICATIONINSIGHTS_CONNECTION_STRING: "InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
```

Apply:
```bash
kubectl apply -f app-insights-secret.yml
```

### Bước 2: Cập nhật Deployment

Thêm `envFrom` vào `backend-deployment.yml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mindx-backend-deployment
spec:
  template:
    spec:
      containers:
      - name: backend-container
        envFrom:
        - secretRef:
            name: app-insights-secret
        # ... các config khác
```

### Bước 3: Apply Deployment

```bash
kubectl apply -f backend-deployment.yml
```

### Bước 4: Verify

```bash
# Kiểm tra pods
kubectl get pods

# Xem logs
kubectl logs <pod-name>

# Test API
kubectl port-forward <pod-name> 8080:8080
curl http://localhost:8080/api/auth/health
```

---

## ✅ Kiểm tra Application Insights hoạt động

### 1. Kiểm tra Logs

Khi app khởi động, bạn sẽ thấy:
```
[Application Insights] Agent is running
[Application Insights] Connection string configured
```

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:8080/api/auth/health

# Login URL
curl http://localhost:8080/api/auth/login-url

# Public endpoint
curl http://localhost:8080/api/auth/public
```

### 3. Kiểm tra Azure Portal (sau 2-5 phút)

1. Vào **Azure Portal** → **Application Insights** resource
2. Vào **Live Metrics** để xem real-time requests
3. Vào **Application map** để xem dependencies
4. Vào **Failures** để xem exceptions
5. Vào **Performance** để xem response times

---

## 🔧 Troubleshooting

### Agent không chạy

**Kiểm tra:**
1. Environment variable đã set chưa:
   ```bash
   echo $APPLICATIONINSIGHTS_CONNECTION_STRING  # Linux/Mac
   echo %APPLICATIONINSIGHTS_CONNECTION_STRING% # Windows CMD
   $env:APPLICATIONINSIGHTS_CONNECTION_STRING   # Windows PowerShell
   ```

2. Agent file có tồn tại không:
   ```bash
   ls -la agents/applicationinsights-agent.jar  # Linux/Mac
   dir agents\applicationinsights-agent.jar    # Windows
   ```

3. Java Agent path đúng chưa:
   - Local: `-javaagent:agents/applicationinsights-agent.jar`
   - Docker: `-javaagent:/app/applicationinsights-agent.jar`

### Không thấy data trên Azure Portal

1. **Đợi 2-5 phút:** Data có thể mất vài phút để xuất hiện
2. **Kiểm tra Connection String:** Đảm bảo đúng format
3. **Kiểm tra logs:** Tìm lỗi trong application logs
4. **Kiểm tra firewall:** Đảm bảo có thể kết nối đến Azure

### Lỗi khi download agent trong Docker

Nếu download fail, có thể download trước và copy vào image:

```dockerfile
# Trong builder stage
RUN wget -q -O applicationinsights-agent.jar \
  https://github.com/microsoft/ApplicationInsights-Java/releases/download/3.4.19/applicationinsights-agent-3.4.19.jar

# Copy vào production stage
COPY --from=builder /app/applicationinsights-agent.jar /app/applicationinsights-agent.jar
```

---

## 📝 Tóm tắt nhanh

### Local Development:
```bash
# 1. Set env var
export APPLICATIONINSIGHTS_CONNECTION_STRING="..."

# 2. Download agent
wget -O agents/applicationinsights-agent.jar https://github.com/microsoft/ApplicationInsights-Java/releases/download/3.4.19/applicationinsights-agent-3.4.19.jar

# 3. Build
mvn clean package

# 4. Run
java -javaagent:agents/applicationinsights-agent.jar -jar target/mindxInternBackend-0.0.1-SNAPSHOT.jar
```

### Docker:
```bash
# 1. Build
docker build -t mindx-backend:latest .

# 2. Run
docker run -p 8080:8080 \
  -e APPLICATIONINSIGHTS_CONNECTION_STRING="..." \
  mindx-backend:latest
```

### Kubernetes:
```bash
# 1. Create secret
kubectl create secret generic app-insights-secret \
  --from-literal=APPLICATIONINSIGHTS_CONNECTION_STRING="..."

# 2. Update deployment với envFrom
# 3. Apply
kubectl apply -f backend-deployment.yml
```

---

## 🎯 Lưu ý quan trọng

- ✅ **Java Agent tự động làm mọi thứ**, không cần code changes
- ✅ **Connection String** phải được set qua environment variable
- ⏱️ **Data có thể mất 2-5 phút** để xuất hiện trên Azure Portal
- 🔒 **Không commit Connection String** vào Git (đã có trong `.gitignore`)

