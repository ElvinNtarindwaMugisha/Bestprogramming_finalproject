package com.university.lostfound.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String identifier; // Registration Number or Admin Name
    private String password;
}
