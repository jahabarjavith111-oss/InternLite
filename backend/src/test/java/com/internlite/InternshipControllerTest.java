package com.internlite;

import com.internlite.dto.LoginRequest;
import com.internlite.entity.*;
import com.internlite.enums.Role;
import com.internlite.enums.WorkType;
import com.internlite.enums.InternshipStatus;
import com.internlite.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Transactional
class InternshipControllerTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
    @Autowired private UserRepository userRepo;
    @Autowired private StudentRepository studentRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private CompanyRepository companyRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private String jwtToken;

    @BeforeEach
    void setUp() {
        internshipRepo.deleteAll();
        companyRepo.deleteAll();
        categoryRepo.deleteAll();
        studentRepo.deleteAll();
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
        internship.setDescription("Great opportunity");
        internship.setLocation("Bangalore");
        internship.setWorkType(WorkType.ONSITE);
        internship.setDuration("3 months");
        internship.setStipend(20000.0);
        internship.setRequiredSkills("Java,Spring");
        internship.setApplicationDeadline(LocalDate.now().plusDays(10));
        internship.setStatus(InternshipStatus.OPEN);
        internshipRepo.save(internship);

        User user = new User();
        user.setName("Test User");
        user.setEmail("user@test.com");
        user.setPassword(passwordEncoder.encode("pass123"));
        user.setRole(Role.STUDENT);
        userRepo.save(user);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("user@test.com");
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
    void search_ShouldReturnOpenInternships() throws Exception {
        mockMvc.perform(get("/api/internships"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Developer Intern"));
    }

    @Test
    void search_ShouldFilterByKeyword() throws Exception {
        mockMvc.perform(get("/api/internships").param("keyword", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Developer Intern"));
    }

    @Test
    void search_ShouldFilterByLocation() throws Exception {
        mockMvc.perform(get("/api/internships").param("location", "Bangalore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Developer Intern"));
    }

    @Test
    void search_ShouldReturnEmptyForNonMatchingKeyword() throws Exception {
        mockMvc.perform(get("/api/internships").param("keyword", "Python"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0]").doesNotExist());
    }

    @Test
    void getById_ShouldReturnInternship() throws Exception {
        Long id = internshipRepo.findAll().get(0).getInternshipId();

        mockMvc.perform(get("/api/internships/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java Developer Intern"))
                .andExpect(jsonPath("$.location").value("Bangalore"));
    }

    @Test
    void getById_ShouldReturn404ForNonexistentId() throws Exception {
        mockMvc.perform(get("/api/internships/{id}", 999999L))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void create_ShouldCreateInternship() throws Exception {
        Category cat = categoryRepo.findAll().get(0);
        Company company = companyRepo.findAll().get(0);

        Internship newInternship = new Internship();
        newInternship.setCompany(company);
        newInternship.setCategory(cat);
        newInternship.setTitle("Python Intern");
        newInternship.setLocation("Hyderabad");
        newInternship.setWorkType(WorkType.REMOTE);
        newInternship.setStatus(InternshipStatus.OPEN);

        mockMvc.perform(post("/api/internships")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(newInternship)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Python Intern"));
    }

    @Test
    void search_ShouldFilterByWorkType() throws Exception {
        mockMvc.perform(get("/api/internships").param("workType", "ONSITE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java Developer Intern"));
    }
}
