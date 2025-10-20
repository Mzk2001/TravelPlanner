package com.travelplanner.controller;

import com.travelplanner.entity.User;
import com.travelplanner.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final UserService userService;

    @GetMapping("/")
    public String hello() {
        return "hello";
    }

    @GetMapping("/health")
    public String health() {
        return "Application is running!";
    }
    
    @GetMapping("/test/users")
    public String getAllUsers() {
        return "User count: " + userService.findByUsername("testuser123").isPresent();
    }
    
    @GetMapping("/test/user")
    public Optional<User> getUserByUsername(@RequestParam String username) {
        return userService.findByUsername(username);
    }
}
