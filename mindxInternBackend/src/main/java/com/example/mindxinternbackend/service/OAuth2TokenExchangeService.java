package com.example.mindxinternbackend.service;

import com.example.mindxinternbackend.config.OpenIDEndpoints;
import com.example.mindxinternbackend.dto.AuthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2TokenExchangeService {

    @Value("${OPENID_CLIENT_ID}")
    private String clientId;

    @Value("${OPENID_CLIENT_SECRET}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Exchange authorization code for access token và lấy user info
     * Trả về cả id_token để dùng cho logout
     */
    public TokenExchangeResult exchangeCodeForUserInfo(String code, String redirectUri) {
        try {
            // 1. Exchange code for token
            TokenResponse tokenResponse = exchangeCodeForToken(code, redirectUri);
            if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
                return new TokenExchangeResult(
                    new AuthResponse(
                        false,
                        "Failed to exchange code for token",
                        null
                    ),
                    null
                );
            }

            // 2. Get user info using access token
            Map<String, Object> userInfo = getUserInfo(tokenResponse.getAccessToken());
            if (userInfo == null) {
                return new TokenExchangeResult(
                    new AuthResponse(
                        false,
                        "Failed to get user info",
                        null
                    ),
                    null
                );
            }

            // 3. Extract user information
            String sub = (String) userInfo.getOrDefault("sub", "");
            String email = (String) userInfo.getOrDefault("email", "");
            String name = (String) userInfo.getOrDefault("name", 
                        userInfo.getOrDefault("preferred_username", ""));
            String picture = (String) userInfo.getOrDefault("picture", "");

            AuthResponse.UserInfo userInfoDto = new AuthResponse.UserInfo(
                sub,
                email,
                name,
                picture
            );

            log.info("User authenticated successfully: {}", email);

            return new TokenExchangeResult(
                new AuthResponse(
                    true,
                    "Authentication successful",
                    userInfoDto
                ),
                tokenResponse.getIdToken()
            );

        } catch (Exception e) {
            log.error("Error exchanging code for user info: ", e);
            return new TokenExchangeResult(
                new AuthResponse(
                    false,
                    "Authentication failed: " + e.getMessage(),
                    null
                ),
                null
            );
        }
    }
    
    /**
     * Inner class để trả về cả AuthResponse và id_token
     */
    @lombok.Getter
    @lombok.AllArgsConstructor
    public static class TokenExchangeResult {
        private final AuthResponse authResponse;
        private final String idToken;
    }
    
    /**
     * Inner class để lưu token response
     */
    @lombok.Getter
    @lombok.AllArgsConstructor
    private static class TokenResponse {
        private final String accessToken;
        private final String idToken;
    }

    /**
     * Exchange authorization code for access token và id_token
     */
    private TokenResponse exchangeCodeForToken(String code, String redirectUri) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Basic Auth với client-id:client-secret
            String credentials = clientId + ":" + clientSecret;
            String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());
            headers.set("Authorization", "Basic " + encodedCredentials);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "authorization_code");
            body.add("code", code);
            body.add("redirect_uri", redirectUri);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                OpenIDEndpoints.TOKEN_ENDPOINT,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> tokenResponse = response.getBody();
                String accessToken = (String) tokenResponse.get("access_token");
                String idToken = (String) tokenResponse.get("id_token");
                return new TokenResponse(accessToken, idToken);
            }

            log.error("Failed to exchange code. Status: {}, Body: {}", 
                response.getStatusCode(), response.getBody());
            return null;

        } catch (Exception e) {
            log.error("Error exchanging code for token: ", e);
            return null;
        }
    }

    /**
     * Get user info using access token
     */
    private Map<String, Object> getUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);

            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                OpenIDEndpoints.USER_INFO_ENDPOINT,
                HttpMethod.GET,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

            log.error("Failed to get user info. Status: {}, Body: {}", 
                response.getStatusCode(), response.getBody());
            return null;

        } catch (Exception e) {
            log.error("Error getting user info: ", e);
            return null;
        }
    }
}

