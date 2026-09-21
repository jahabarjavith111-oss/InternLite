package com.internlite;

import com.internlite.dto.LoginRequest;
import com.internlite.entity.*;
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
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class StudentControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();
    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private CompanyRepository companyRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private StudentSkillRepository studentSkillRepo;
    @Autowired private ApplicationRepository appRepo;
    @Autowired private StatusHistoryRepository historyRepo;
    @Autowired private InterviewRepository interviewRepo;
    @Autowired private ResumeRepository resumeRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private AuditLogRepository auditLogRepo;
    @Autowired private JobApplicationRepository jobAppRepo;
    @Autowired private JobRepository jobRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private String jwtToken;

    @BeforeEach
    void setUp() {
        jobAppRepo.deleteAll();
        appRepo.deleteAll();
        historyRepo.deleteAll();
        interviewRepo.deleteAll();
        notificationRepo.deleteAll();
        resumeRepo.deleteAll();
        studentSkillRepo.deleteAll();
        studentRepo.deleteAll();
        jobRepo.deleteAll();
        internshipRepo.deleteAll();
        companyRepo.deleteAll();
        categoryRepo.deleteAll();
        skillRepo.deleteAll();
        auditLogRepo.deleteAll();
        userRepo.deleteAll();

        User user = new User();
        user.setName("Test Student");
        user.setEmail("student@test.com");
        user.setPassword(passwordEncoder.encode("pass123"));
        user.setRole(Role.STUDENT);
        userRepo.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setCollege("Test College");
        student.setDegree("B.Tech");
        student.setBranch("CSE");
        student.setGraduationYear(2025);
        student.setLocation("Bangalore");
        student.setBio("Aspiring developer");
        studentRepo.save(student);

        Category cat = new Category();
        cat.setCategoryName("Technology");
        categoryRepo.save(cat);

        Company company = new Company();
        company.setCompanyName("Test Company");
        companyRepo.save(company);

        Internship internship = new Internship();
        internship.setCompany(company);
        internship.setCategory(cat);
        internship.setTitle("Java Developer Intern");
        internship.setLocation("Bangalore");
        internship.setWorkType(WorkType.ONSITE);
        internship.setStatus(InternshipStatus.OPEN);
        internshipRepo.save(internship);

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
    void getProfile_ShouldReturnStudentProfile() throws Exception {
        mockMvc.perform(get("/api/students/profile")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.college").value("Test College"))
                .andExpect(jsonPath("$.degree").value("B.Tech"))
                .andExpect(jsonPath("$.location").value("Bangalore"));
    }

    @Test
    void getProfile_ShouldFail_WithoutAuth() throws Exception {
        mockMvc.perform(get("/api/students/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateProfile_ShouldUpdateStudentDetails() throws Exception {
        Student update = new Student();
        update.setCollege("Updated College");
        update.setDegree("M.Tech");
        update.setBranch("IT");
        update.setGraduationYear(2026);
        update.setLocation("Delhi");
        update.setBio("Updated bio");

        mockMvc.perform(put("/api/students/profile")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.college").value("Updated College"))
                .andExpect(jsonPath("$.degree").value("M.Tech"))
                .andExpect(jsonPath("$.location").value("Delhi"));
    }
}
