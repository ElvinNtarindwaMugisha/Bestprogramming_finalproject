package com.university.lostfound.controller;

import com.university.lostfound.dto.AuthRequest;
import com.university.lostfound.dto.AuthResponse;
import com.university.lostfound.model.Administration;
import com.university.lostfound.model.User;
import com.university.lostfound.repository.AdministrationRepository;
import com.university.lostfound.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final AdministrationRepository adminRepository;

    public AuthController(UserRepository userRepository, AdministrationRepository adminRepository) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = new AuthResponse();

        // 1. Try to find as Admin
        Optional<Administration> admin = adminRepository.findByAdminName(request.getIdentifier());
        if (admin.isPresent()) {
            // For this project logic, we check password (naive match for now or assume
            // null/matching if not set)
            if (request.getPassword() != null && request.getPassword().equals(admin.get().getPassword())) {
                response.setSuccess(true);
                response.setId(admin.get().getAdminId());
                response.setName(admin.get().getAdminName());
                response.setRole("Administrator");
                response.setIdentifier(admin.get().getAdminName());
                return ResponseEntity.ok(response);
            }
        }

        // 2. Try to find as User (Student)
        Optional<User> user = userRepository.findByRegistrationNumber(request.getIdentifier());
        if (user.isPresent()) {
            if (request.getPassword() != null && request.getPassword().equals(user.get().getPassword())) {
                response.setSuccess(true);
                response.setId(user.get().getId());
                response.setName(user.get().getFullName());
                response.setRole("Student");
                response.setIdentifier(user.get().getRegistrationNumber());
                return ResponseEntity.ok(response);
            }
        }

        // 3. Fallback for demonstration if no password set (match identifier to
        // password)
        if (request.getIdentifier().equals(request.getPassword())) {
            if (admin.isPresent()) {
                response.setSuccess(true);
                response.setId(admin.get().getAdminId());
                response.setName(admin.get().getAdminName());
                response.setRole("Administrator");
                response.setIdentifier(admin.get().getAdminName());
                return ResponseEntity.ok(response);
            } else if (user.isPresent()) {
                response.setSuccess(true);
                response.setId(user.get().getId());
                response.setName(user.get().getFullName());
                response.setRole("Student");
                response.setIdentifier(user.get().getRegistrationNumber());
                return ResponseEntity.ok(response);
            }
        }

        response.setSuccess(false);
        response.setMessage("Invalid credentials");
        return ResponseEntity.status(401).body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        AuthResponse response = new AuthResponse();
        try {
            String regNum = user.getRegistrationNumber();

            if (regNum != null && regNum.startsWith("@")) {
                // Register as Admin
                if (adminRepository.findByAdminName(regNum).isPresent()) {
                    response.setSuccess(false);
                    response.setMessage("Admin name already exists");
                    return ResponseEntity.badRequest().body(response);
                }

                Administration admin = new Administration();
                admin.setAdminName(regNum);
                admin.setPassword(user.getPassword());
                admin.setOfficeName("General Office"); // Default
                adminRepository.save(admin);

                response.setSuccess(true);
                response.setName(admin.getAdminName());
                response.setRole("Administrator");
                response.setIdentifier(admin.getAdminName());
                response.setMessage("Administrator registered successfully");
                return ResponseEntity.ok(response);
            } else {
                // Register as Student/User
                if (userRepository.findByRegistrationNumber(regNum).isPresent()) {
                    response.setSuccess(false);
                    response.setMessage("Registration number already exists");
                    return ResponseEntity.badRequest().body(response);
                }

                userRepository.save(user);

                response.setSuccess(true);
                response.setName(user.getFullName());
                response.setRole("Student");
                response.setIdentifier(user.getRegistrationNumber());
                response.setMessage("User registered successfully");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Registration failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
