package com.example.mindxinternbackend.config;

/**
 * OpenID Connect endpoints từ discovery document
 * https://id-dev.mindx.edu.vn/.well-known/openid-configuration
 */
public class OpenIDEndpoints {
    
    public static final String ISSUER = "https://id-dev.mindx.edu.vn";
    public static final String AUTHORIZATION_ENDPOINT = "https://id-dev.mindx.edu.vn/auth";
    public static final String TOKEN_ENDPOINT = "https://id-dev.mindx.edu.vn/token";
    public static final String USER_INFO_ENDPOINT = "https://id-dev.mindx.edu.vn/me";
    public static final String JWKS_URI = "https://id-dev.mindx.edu.vn/jwks";
    public static final String END_SESSION_ENDPOINT = "https://id-dev.mindx.edu.vn/session/end";
    public static final String PUSHED_AUTHORIZATION_REQUEST_ENDPOINT = "https://id-dev.mindx.edu.vn/request";
    
    private OpenIDEndpoints() {
        // Utility class
    }
}

