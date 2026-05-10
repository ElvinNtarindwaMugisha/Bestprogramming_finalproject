package com.university.lostfound.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private Long id;
    private String name;
    private String role; // "Student" or "Administrator"
    private String identifier;
    private boolean success;
    private String message;
}
