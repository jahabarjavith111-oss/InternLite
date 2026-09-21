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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class JobControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();
    @Autowired private UserRepository userRepo;
    @Autowired private CompanyRepository companyRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private JobRepository jobRepo;
    @Autowired private JobApplicationRepository jobAppRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private AuditLogRepository auditLogRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private String studentToken;
    private Long jobId;

    @BeforeEach
    void setUp() {
        jobAppRepo.deleteAll();
        jobRepo.deleteAll();
        notificationRepo.deleteAll();
        auditLogRepo.deleteAll();
        companyRepo.deleteAll();
        categoryRepo.deleteAll();
        studentRepo.deleteAll();
        userRepo.deleteAll();

        Category cat = new Category();
        cat.setCategoryName("Engineering");
        categoryRepo.save(cat);

        Company company = new Company();
        company.setCompanyName("Hire Co");
        companyRepo.save(company);

        Job job = new Job();
        job.setCompany(company);
        job.setCategory(cat);
        job.setTitle("Backend Engineer");
        job.setDescription("Full-time backend role");
        job.setLocation("Chennai");
        job.setWorkType(WorkType.HYBRID);
        job.setEmploymentType("FULL_TIME");
        job.setSalary(800000.0);
        job.setRequiredSkills("Java,Spring");
        job.setStatus(InternshipStatus.OPEN);
        jobId = jobRepo.save(job).getJobId();

        User user = new User();
        user.setName("Job Seeker");
        user.setEmail("seeker@test.com");
        user.setPassword(passwordEncoder.encode("pass123"));
        user.setRole(Role.STUDENT);
        User saved = userRepo.save(user);

        Student s = new Student();
        s.setUser(saved);
        s.setCollege("Test College");
        studentRepo.save(s);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("seeker@test.com");
        loginReq.setPassword("pass123");
        try {
            var res = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(loginReq)))
                    .andExpect(status().isOk())
                    .andReturn();
            studentToken = res.getResponse().getContentAsString().split("\"token\":\"")[1].split("\"")[0];
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void search_ShouldReturnOpenJobs_Public() throws Exception {
        mockMvc.perform(get("/api/jobs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Backend Engineer"));
    }

    @Test
    void search_ShouldFilterByKeyword() throws Exception {
        mockMvc.perform(get("/api/jobs").param("keyword", "Backend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Backend Engineer"));
    }

    @Test
    void getById_ShouldReturnJob_Public() throws Exception {
        mockMvc.perform(get("/api/jobs/" + jobId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Backend Engineer"));
    }

    @Test
    void apply_ShouldSucceed_ForStudent() throws Exception {
        mockMvc.perform(post("/api/job-applications")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobId\":" + jobId + ",\"coverLetter\":\"I am a fit\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPLIED"));
    }

    @Test
    void my_ShouldReturnStudentJobApplications() throws Exception {
        mockMvc.perform(post("/api/job-applications")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobId\":" + jobId + "}"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/job-applications/my")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].job.title").value("Backend Engineer"));
    }
}
