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
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class RecruiterInternshipUpdateTest {

    @Autowired private MockMvc mockMvc;
    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
    @Autowired private UserRepository userRepo;
    @Autowired private RecruiterRepository recruiterRepo;
    @Autowired private CompanyRepository companyRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private InternshipRepository internshipRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private String recruiterToken;
    private Long internshipId;
    private Long otherInternshipId;

    @BeforeEach
    void setUp() {
        internshipRepo.deleteAll();
        recruiterRepo.deleteAll();
        companyRepo.deleteAll();
        categoryRepo.deleteAll();
        userRepo.deleteAll();

        Company mine = new Company();
        mine.setCompanyName("My Co");
        mine = companyRepo.save(mine);

        Company other = new Company();
        other.setCompanyName("Other Co");
        other = companyRepo.save(other);

        User rec = new User();
        rec.setName("Rec R");
        rec.setEmail("rec@test.com");
        rec.setPassword(passwordEncoder.encode("pass123"));
        rec.setRole(Role.RECRUITER);
        User savedRec = userRepo.save(rec);

        Recruiter r = new Recruiter();
        r.setUser(savedRec);
        r.setCompany(mine);
        recruiterRepo.save(r);

        Internship mine1 = new Internship();
        mine1.setCompany(mine);
        mine1.setTitle("Old Title");
        mine1.setDescription("Old desc");
        mine1.setLocation("Chennai");
        mine1.setWorkType(WorkType.REMOTE);
        mine1.setStatus(InternshipStatus.OPEN);
        internshipId = internshipRepo.save(mine1).getInternshipId();

        Internship theirs = new Internship();
        theirs.setCompany(other);
        theirs.setTitle("Theirs");
        theirs.setStatus(InternshipStatus.OPEN);
        otherInternshipId = internshipRepo.save(theirs).getInternshipId();

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("rec@test.com");
        loginReq.setPassword("pass123");
        try {
            var res = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(loginReq)))
                    .andExpect(status().isOk())
                    .andReturn();
            recruiterToken = res.getResponse().getContentAsString().split("\"token\":\"")[1].split("\"")[0];
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void update_ShouldSucceed_ForOwnInternship() throws Exception {
        mockMvc.perform(put("/api/recruiter/internships/" + internshipId)
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"New Title\",\"stipend\":25000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Title"))
                .andExpect(jsonPath("$.stipend").value(25000));
    }

    @Test
    void update_ShouldFail_ForForeignInternship() throws Exception {
        mockMvc.perform(put("/api/recruiter/internships/" + otherInternshipId)
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Hacked\"}"))
                .andExpect(status().is5xxServerError());
    }
}
