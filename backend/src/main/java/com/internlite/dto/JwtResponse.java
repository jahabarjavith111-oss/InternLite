package com.internlite.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class JwtResponse {
    private String token;
    private String email;
    private String role;
    private Long userId;
    private String name;
}
