package com.example.mindxinternbackend.service;

import com.example.mindxinternbackend.config.OpenIDEndpoints;
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

/**
 * Service để sử dụng Pushed Authorization Request (PAR) endpoint
 * Nếu authorization endpoint trực tiếp không hoạt động, có thể thử PAR
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PARService {

    @Value("${OPENID_CLIENT_ID}")
    private String clientId;

    @Value("${OPENID_CLIENT_SECRET}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Push authorization request và lấy request_uri
     * Sau đó frontend sẽ redirect đến authorization endpoint với request_uri
     */
    public String pushAuthorizationRequest(String redirectUri, String state, String nonce, String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Basic Auth với client-id:client-secr et
            String credentials = clientId + ":" + clientSecret;
            String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());
            headers.set("Authorization", "Basic " + encodedCredentials);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("redirect_uri", redirectUri);
            body.add("response_type", "code");
            body.add("scope", "openid profile email");
            body.add("state", state);
            body.add("nonce", nonce);
            
            // Thêm prompt nếu có (để tránh lỗi consent)
            if (prompt != null && !prompt.isEmpty() && !prompt.equals("none")) {
                body.add("prompt", prompt);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                OpenIDEndpoints.PUSHED_AUTHORIZATION_REQUEST_ENDPOINT,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                Map<String, Object> parResponse = response.getBody();
                if (parResponse != null && parResponse.containsKey("request_uri")) {
                    return (String) parResponse.get("request_uri");
                }
            }

            log.error("Failed to push authorization request. Status: {}, Body: {}", 
                response.getStatusCode(), response.getBody());
            return null;

        } catch (Exception e) {
            log.error("Error pushing authorization request: ", e);
            return null;
        }
    }
}

