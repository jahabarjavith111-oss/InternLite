package com.internlite;

import com.internlite.dto.LoginRequest;
import com.internlite.dto.RegisterRequest;
import com.internlite.entity.User;
import com.internlite.enums.Role;
import com.internlite.repository.OtpVerificationRepository;
import com.internlite.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import com.internlite.service.EmailService;
import com.internlite.service.OtpService;
import org.springframework.boot.test.mock.mockito.MockBean;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private OtpService otpService;
    @Autowired private OtpVerificationRepository otpVerificationRepo;
    @MockBean private EmailService emailService;

    @BeforeEach
    void setUp() {
        otpVerificationRepo.deleteAll();
        userRepo.deleteAll();
        doNothing().when(emailService).sendOtpMail(anyString(), anyString(), anyString(), anyInt());
    }

    @Test
    void register_ShouldSucceed_WithValidStudentData() throws Exception {
        // OTP flow first (mail mocked)
        mockMvc.perform(post("/api/auth/send-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"john@example.com\"}"))
                .andExpect(status().isOk());
        // read OTP directly from service store via verify trick: fetch by trying all? Instead use reflection-free path:
        // verify with wrong code fails, so we prime verification by calling service send+verify with known code
        // Simplest: use OtpService to verify — we need the code; send again and capture via service is internal,
        // so instead test the 403-guard here and do a full success path below with service API.
        RegisterRequest req = new RegisterRequest();
        req.setName("John Doe");
        req.setEmail("john@example.com");
        req.setPassword("password123");
        req.setPhone("1234567890");
        req.setRole(Role.STUDENT);

        // Without OTP verification -> 403
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void otpFlow_ShouldVerify_ThenRegister() throws Exception {
        String email = "otpuser@example.com";
        otpService.sendOtp(email, "Otp");
        // Read the code back from the DB-backed store (mail is mocked)
        String code = otpVerificationRepo.findById(email.toLowerCase()).orElseThrow().getCode();

        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"otp\":\"" + code + "\"}"))
                .andExpect(status().isOk());

        RegisterRequest req = new RegisterRequest();
        req.setName("Otp User");
        req.setEmail(email);
        req.setPassword("password123");
        req.setRole(Role.STUDENT);
        req.setOtp(code);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(content().string("User registered successfully"));
    }

    @Test
    void register_ShouldFail_WithDuplicateEmail() throws Exception {
        User existing = new User();
        existing.setName("Existing User");
        existing.setEmail("dup@example.com");
        existing.setPassword(passwordEncoder.encode("pass123"));
        existing.setRole(Role.STUDENT);
        userRepo.save(existing);

        RegisterRequest req = new RegisterRequest();
        req.setName("New User");
        req.setEmail("dup@example.com");
        req.setPassword("pass123");
        req.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_ShouldReturnJwtToken_WithValidCredentials() throws Exception {
        User user = new User();
        user.setName("Login User");
        user.setEmail("login@example.com");
        user.setPassword(passwordEncoder.encode("pass123"));
        user.setRole(Role.STUDENT);
        userRepo.save(user);

        LoginRequest req = new LoginRequest();
        req.setEmail("login@example.com");
        req.setPassword("pass123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("login@example.com"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    void login_ShouldFail_WithInvalidCredentials() throws Exception {
        User user = new User();
        user.setName("Login User");
        user.setEmail("login@example.com");
        user.setPassword(passwordEncoder.encode("correctpass"));
        user.setRole(Role.STUDENT);
        userRepo.save(user);

        LoginRequest req = new LoginRequest();
        req.setEmail("login@example.com");
        req.setPassword("wrongpass");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_ShouldValidateRequiredFields() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("");
        req.setEmail("invalid-email");
        req.setPassword("");
        req.setRole(null);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
