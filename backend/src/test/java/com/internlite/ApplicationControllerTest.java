package com.internlite;

import com.internlite.dto.ApplicationRequest;
import com.internlite.dto.LoginRequest;
import com.internlite.entity.*;
import com.internlite.enums.ApplicationStatus;
import com.internlite.enums.Role;
import com.internlite.enums.WorkType;
import com.internlite.enums.InternshipStatus;
import com.internlite.repository.*;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Transactional
class ApplicationControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();
    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private CompanyRepository companyRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private ApplicationRepository appRepo;
    @Autowired private StatusHistoryRepository historyRepo;
    @Autowired private InterviewRepository interviewRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private ResumeRepository resumeRepo;
    @Autowired private AuditLogRepository auditLogRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private String jwtToken;
    private Long internshipId;

    @BeforeEach
    void setUp() {
        historyRepo.deleteAll();
        interviewRepo.deleteAll();
        notificationRepo.deleteAll();
        resumeRepo.deleteAll();
        appRepo.deleteAll();
        internshipRepo.deleteAll();
        companyRepo.deleteAll();
        categoryRepo.deleteAll();
        studentRepo.deleteAll();
        auditLogRepo.deleteAll();
        userRepo.deleteAll();

        Category cat = categoryRepo.findByCategoryNameIgnoreCase("Technology").orElseGet(() -> {
            Category c = new Category();
            c.setCategoryName("Technology");
            return categoryRepo.save(c);
        });

        Company company = new Company();
        company.setCompanyName("Tech Corp");
        companyRepo.save(company);

        Internship internship = new Internship();
        internship.setCompany(company);
        internship.setCategory(cat);
        internship.setTitle("Java Developer Intern");
        internship.setLocation("Bangalore");
        internship.setWorkType(WorkType.ONSITE);
        internship.setStatus(InternshipStatus.OPEN);
        internshipRepo.save(internship);
        internshipId = internship.getInternshipId();

        User user = new User();
        user.setName("Test Student");
        user.setEmail("student@test.com");
        user.setPassword(passwordEncoder.encode("pass123"));
        user.setRole(Role.STUDENT);
        userRepo.save(user);

        Student student = new Student();
        student.setUser(user);
        studentRepo.save(student);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("student@test.com");
        loginReq.setPassword("pass123");

        try {
            var res = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(loginReq)))
                    .andExpect(status().isOk())
                    .andReturn();
            String body = res.getResponse().getContentAsString();
            jwtToken = body.split("\"token\":\"")[1].split("\"")[0];
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void apply_ShouldCreateApplication() throws Exception {
        ApplicationRequest req = new ApplicationRequest();
        req.setInternshipId(internshipId);
        req.setCoverLetter("I am very interested in this position.");
        req.setResumeId(null);

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }

    @Test
    void myApplications_ShouldReturnStudentApplications() throws Exception {
        ApplicationRequest req = new ApplicationRequest();
        req.setInternshipId(internshipId);
        req.setCoverLetter("Cover letter");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/applications/my")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].internship.title").value("Java Developer Intern"));
    }

    @Test
    void apply_ShouldFail_WhenAlreadyApplied() throws Exception {
        ApplicationRequest req = new ApplicationRequest();
        req.setInternshipId(internshipId);
        req.setCoverLetter("First application");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        ApplicationRequest req2 = new ApplicationRequest();
        req2.setInternshipId(internshipId);
        req2.setCoverLetter("Second application");

        mockMvc.perform(post("/api/applications")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req2)))
                .andExpect(status().isConflict());
    }
}
