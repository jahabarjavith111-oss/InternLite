package com.internlite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OtpVerifyRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String otp;
}
