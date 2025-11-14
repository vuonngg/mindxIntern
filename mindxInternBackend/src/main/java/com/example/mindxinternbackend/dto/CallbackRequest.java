package com.example.mindxinternbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CallbackRequest {
    private String code;
    private String state;
    private String redirectUri; // Optional: frontend redirect URI
}

