package com.internlite.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OtpRequest {
    @NotBlank @Email
    private String email;
    /** Optional — used as {{firstName}} in the OTP mail template */
    private String name;
}
