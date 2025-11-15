package com.example.mindxinternbackend.exception;

import com.example.mindxinternbackend.dto.AuthResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global Exception Handler
 * Application Insights Java Agent sẽ tự động track exceptions
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Xử lý tất cả exceptions chưa được catch
     * Application Insights Java Agent sẽ tự động track exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<AuthResponse> handleException(Exception ex) {
        log.error("Unhandled exception: ", ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            new AuthResponse(
                false,
                "Internal server error: " + ex.getMessage(),
                null
            )
        );
    }

    /**
     * Xử lý IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<AuthResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            new AuthResponse(
                false,
                "Invalid request: " + ex.getMessage(),
                null
            )
        );
    }

    /**
     * Xử lý RuntimeException
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<AuthResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception: ", ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            new AuthResponse(
                false,
                "Runtime error: " + ex.getMessage(),
                null
            )
        );
    }
}

