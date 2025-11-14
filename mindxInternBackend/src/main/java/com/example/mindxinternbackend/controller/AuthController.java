package com.example.mindxinternbackend.controller;

import com.example.mindxinternbackend.config.OpenIDEndpoints;
import com.example.mindxinternbackend.dto.AuthResponse;
import com.example.mindxinternbackend.dto.CallbackRequest;
import com.example.mindxinternbackend.service.OAuth2TokenExchangeService;
import com.example.mindxinternbackend.service.PARService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final OAuth2TokenExchangeService oAuth2TokenExchangeService;
    private final PARService parService;

    @Value("${OPENID_CLIENT_ID}")
    private String clientId;

    /**
     * Get authorization URL để frontend redirect user
     * Frontend sẽ dùng URL này để redirect user đến OpenID provider
     * 
     * @param redirectUri - Redirect URI sau khi login (default: https://onboarding.mindx.edu.vn/auth/callback)
     * @param state - State parameter (tự động generate nếu không có)
     * @param usePAR - Sử dụng Pushed Authorization Request nếu true (default: false)
     * @param prompt - Prompt parameter: "login", "consent", "none" (optional, không set mặc định để tránh lỗi unsupported)
     */
    @GetMapping("/login-url")
    public ResponseEntity<AuthResponse> getLoginUrl(
            @RequestParam(required = false, defaultValue = "https://onboarding.mindx.edu.vn/auth/callback") String redirectUri,
            @RequestParam(required = false) String state,
            @RequestParam(required = false, defaultValue = "false") boolean usePAR,
            @RequestParam(required = false) String prompt) {
        
        // Generate state nếu không có
        if (state == null || state.isEmpty()) {
            state = UUID.randomUUID().toString();
        }
        
        // Generate nonce cho OpenID Connect
        String nonce = UUID.randomUUID().toString();
        
        String loginUrl;
        
        if (usePAR) {
            // Sử dụng Pushed Authorization Request
            String requestUri = parService.pushAuthorizationRequest(redirectUri, state, nonce, prompt);
            if (requestUri != null) {
                loginUrl = OpenIDEndpoints.AUTHORIZATION_ENDPOINT + "?client_id=" + 
                          URLEncoder.encode(clientId, StandardCharsets.UTF_8) +
                          "&request_uri=" + URLEncoder.encode(requestUri, StandardCharsets.UTF_8);
            } else {
                // Fallback về cách thông thường nếu PAR fail
                loginUrl = buildStandardAuthorizationUrl(redirectUri, state, nonce, prompt);
            }
        } else {
            // Sử dụng authorization URL thông thường
            loginUrl = buildStandardAuthorizationUrl(redirectUri, state, nonce, prompt);
        }
        
        return ResponseEntity.ok(new AuthResponse(
            true,
            loginUrl,
            null
        ));
    }
    
    /**
     * Build standard authorization URL (không dùng PAR)
     * Chỉ thêm prompt nếu được yêu cầu (không set mặc định để tránh lỗi unsupported prompt value)
     */
    private String buildStandardAuthorizationUrl(String redirectUri, String state, String nonce, String prompt) {
        StringBuilder urlBuilder = new StringBuilder(OpenIDEndpoints.AUTHORIZATION_ENDPOINT);
        urlBuilder.append("?client_id=").append(URLEncoder.encode(clientId, StandardCharsets.UTF_8));
        urlBuilder.append("&redirect_uri=").append(URLEncoder.encode(redirectUri, StandardCharsets.UTF_8));
        urlBuilder.append("&response_type=code");
        urlBuilder.append("&scope=").append(URLEncoder.encode("openid profile email", StandardCharsets.UTF_8));
        urlBuilder.append("&state=").append(URLEncoder.encode(state, StandardCharsets.UTF_8));
        urlBuilder.append("&nonce=").append(URLEncoder.encode(nonce, StandardCharsets.UTF_8));
        
        // Chỉ thêm prompt nếu được yêu cầu cụ thể
        // Các giá trị được hỗ trợ: "login", "consent", "none"
        // Không set mặc định để tránh lỗi "unsupported prompt value"
        if (prompt != null && !prompt.isEmpty() && !prompt.equals("none")) {
            urlBuilder.append("&prompt=").append(URLEncoder.encode(prompt, StandardCharsets.UTF_8));
        }
        
        return urlBuilder.toString();
    }

    /**
     * Get current authenticated user information từ session
     */
    @GetMapping("/user/me")
    public ResponseEntity<AuthResponse> getCurrentUser(jakarta.servlet.http.HttpServletRequest request) {
        // Lấy user từ session (đã lưu sau khi callback thành công)
        Object userObj = request.getSession().getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(401).body(new AuthResponse(
                false,
                "User not authenticated",
                null
            ));
        }

        // Convert từ Map sang AuthResponse
        if (userObj instanceof AuthResponse.UserInfo) {
            AuthResponse.UserInfo userInfo = (AuthResponse.UserInfo) userObj;
            return ResponseEntity.ok(new AuthResponse(
                true,
                "User retrieved successfully",
                userInfo
            ));
        }

        return ResponseEntity.status(401).body(new AuthResponse(
            false,
            "Invalid user session",
            null
        ));
    }

    /**
     * Check if user is authenticated
     */
    @GetMapping("/check")
    public ResponseEntity<AuthResponse> checkAuth(jakarta.servlet.http.HttpServletRequest request) {
        Object userObj = request.getSession().getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(401).body(new AuthResponse(
                false,
                "User is not authenticated",
                null
            ));
        }

        if (userObj instanceof AuthResponse.UserInfo) {
            AuthResponse.UserInfo userInfo = (AuthResponse.UserInfo) userObj;
            return ResponseEntity.ok(new AuthResponse(
                true,
                "User is authenticated",
                userInfo
            ));
        }

        return ResponseEntity.status(401).body(new AuthResponse(
            false,
            "Invalid user session",
            null
        ));
    }

    /**
     * Callback endpoint - Frontend nhận code từ OpenID provider và gửi lên backend
     * Backend sẽ exchange code lấy token và trả về user info
     * 
     * Flow:
     * 1. Frontend redirect user đến OpenID provider
     * 2. User login và OpenID provider redirect về frontend với code
     * 3. Frontend gọi API này với code để backend exchange và lấy user info
     */
    @PostMapping("/callback")
    public ResponseEntity<AuthResponse> handleCallback(
            @RequestBody CallbackRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        if (request.getCode() == null || request.getCode().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse(
                false,
                "Authorization code is required",
                null
            ));
        }

        // Sử dụng redirectUri từ request hoặc default
        String redirectUri = request.getRedirectUri();
        if (redirectUri == null || redirectUri.isEmpty()) {
            // Default redirect URI (phải match với redirect URI đã đăng ký)
            redirectUri = "https://onboarding.mindx.edu.vn/auth/callback";
        }

        // Exchange code for user info
        OAuth2TokenExchangeService.TokenExchangeResult result = oAuth2TokenExchangeService.exchangeCodeForUserInfo(
            request.getCode(),
            redirectUri
        );

        AuthResponse response = result.getAuthResponse();
        if (response.isSuccess() && response.getUser() != null) {
            // Lưu user và id_token vào session để dùng cho logout
            httpRequest.getSession().setAttribute("user", response.getUser());
            httpRequest.getSession().setAttribute("authenticated", true);
            if (result.getIdToken() != null) {
                httpRequest.getSession().setAttribute("id_token", result.getIdToken());
            }
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Get logout URL để frontend redirect đến MindX OpenID provider
     * 
     * Flow:
     * 1. FE gọi GET /api/auth/get-logout
     * 2. BE trả về Logout URL (chứa id_token_hint, client_id)
     * 3. FE tự thêm post_logout_redirect_uri và redirect đến Logout URL
     * 4. MindX IdP xóa Session và redirect về FE
     * 5. FE gọi POST /api/auth/logout để xóa Session Spring Boot cục bộ
     */
    @GetMapping("/get-logout")
    public ResponseEntity<AuthResponse> getLogoutUrl(jakarta.servlet.http.HttpServletRequest request) {
        // Lấy id_token từ session
        String idToken = null;
        if (request.getSession() != null) {
            idToken = (String) request.getSession().getAttribute("id_token");
        }
        
        // Tạo logout URL với id_token_hint và client_id
        // Frontend sẽ tự thêm post_logout_redirect_uri khi redirect
        String logoutUrl = buildLogoutUrlForFrontend(idToken);
        
        return ResponseEntity.ok(new AuthResponse(
            true,
            logoutUrl,
            null
        ));
    }
    
    /**
     * Logout endpoint - chỉ xóa session local trên Spring Boot
     * Frontend gọi endpoint này sau khi đã logout thành công trên MindX IdP
     */
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(jakarta.servlet.http.HttpServletRequest request) {
        // Xóa session local
        if (request.getSession() != null) {
            request.getSession().invalidate();
            log.info("Local session invalidated");
        }
        
        return ResponseEntity.ok(new AuthResponse(
            true,
            "Logout successful",
            null
        ));
    }
    
    /**
     * Build logout URL cho frontend
     * Chỉ chứa id_token_hint và client_id
     * Frontend sẽ tự thêm post_logout_redirect_uri khi redirect
     * Format: https://id-dev.mindx.edu.vn/session/end?client_id=...&id_token_hint=...
     */
    private String buildLogoutUrlForFrontend(String idToken) {
        StringBuilder urlBuilder = new StringBuilder(OpenIDEndpoints.END_SESSION_ENDPOINT);
        
        // Thêm client_id (bắt buộc để logout trên OpenID provider)
        urlBuilder.append("?client_id=").append(URLEncoder.encode(clientId, StandardCharsets.UTF_8));
        
        // Thêm id_token_hint nếu có (để logout trên OpenID provider)
        if (idToken != null && !idToken.isEmpty()) {
            urlBuilder.append("&id_token_hint=").append(URLEncoder.encode(idToken, StandardCharsets.UTF_8));
        }
        
        return urlBuilder.toString();
    }

    /**
     * Public endpoint - no authentication required
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OpenID Connect Auth API is running");
    }

    /**
     * Public endpoint - no authentication required
     */
    @GetMapping("/public")
    public ResponseEntity<String> publicEndpoint() {
        return ResponseEntity.ok("This is a public endpoint, no authentication required");
    }
}

