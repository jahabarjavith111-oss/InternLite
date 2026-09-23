package com.internlite;

import com.internlite.dto.LoginRequest;
import com.internlite.entity.*;
import com.internlite.enums.Role;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Transactional
class StudentDirectoryTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper();
    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private SkillRepository skillRepo;
    @Autowired private StudentSkillRepository studentSkillRepo;
    @Autowired private NotificationRepository notificationRepo;
    @Autowired private AuditLogRepository auditLogRepo;
    @Autowired private JobApplicationRepository jobAppRepo;
    @Autowired private ApplicationRepository applicationRepo;
    @Autowired private StatusHistoryRepository historyRepo;
    @Autowired private InterviewRepository interviewRepo;
    @Autowired private ResumeRepository resumeRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private String studentToken;
    private String recruiterToken;

    @BeforeEach
    void setUp() {
        jobAppRepo.deleteAll();
        applicationRepo.deleteAll();
        historyRepo.deleteAll();
        interviewRepo.deleteAll();
        resumeRepo.deleteAll();
        studentSkillRepo.deleteAll();
        studentRepo.deleteAll();
        skillRepo.deleteAll();
        notificationRepo.deleteAll();
        auditLogRepo.deleteAll();
        userRepo.deleteAll();

        User stu = new User();
        stu.setName("Dir Student");
        stu.setEmail("dirstudent@test.com");
        stu.setPassword(passwordEncoder.encode("pass123"));
        stu.setRole(Role.STUDENT);
        User savedStu = userRepo.save(stu);

        Student s = new Student();
        s.setUser(savedStu);
        s.setCollege("Dir College");
        s.setDegree("B.E");
        Student savedS = studentRepo.save(s);

        Skill sk = new Skill();
        sk.setSkillName("DirJava");
        Skill savedSk = skillRepo.save(sk);

        StudentSkill ss = new StudentSkill();
        ss.setStudent(savedS);
        ss.setSkill(savedSk);
        studentSkillRepo.save(ss);

        User rec = new User();
        rec.setName("Dir Recruiter");
        rec.setEmail("dirrec@test.com");
        rec.setPassword(passwordEncoder.encode("pass123"));
        rec.setRole(Role.RECRUITER);
        userRepo.save(rec);

        studentToken = login("dirstudent@test.com");
        recruiterToken = login("dirrec@test.com");
    }

    private String login(String email) {
        LoginRequest req = new LoginRequest();
        req.setEmail(email);
        req.setPassword("pass123");
        try {
            var res = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(req)))
                    .andExpect(status().isOk())
                    .andReturn();
            return res.getResponse().getContentAsString().split("\"token\":\"")[1].split("\"")[0];
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void directory_ShouldHideContact_FromStudents() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Dir Student"))
                .andExpect(jsonPath("$[0].email").doesNotExist())
                .andExpect(jsonPath("$[0].skills[0]").value("DirJava"));
    }

    @Test
    void directory_ShouldShowContact_ToRecruiters() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("dirstudent@test.com"));
    }

    @Test
    void directory_ShouldFilterBySkill() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + recruiterToken)
                .param("skill", "dirjava"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Dir Student"));
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + recruiterToken)
                .param("skill", "nosuchskill"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void directory_ShouldRequireAuth() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }
}
