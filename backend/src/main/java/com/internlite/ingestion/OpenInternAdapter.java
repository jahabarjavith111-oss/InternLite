package com.internlite.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenInternAdapter implements SourceAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ingestion.openintern.enabled:true}")
    private boolean enabled;

    @Value("${app.ingestion.openintern.url:https://openintern.dev/api/v1/jobs}")
    private String apiUrl;

    @Value("${app.ingestion.openintern.limit:200}")
    private int limit;

    @Override
    public String getSource() { return "openintern"; }

    @Override
    public List<CanonicalJob> fetch() throws Exception {
        if (!enabled) return List.of();
        List<CanonicalJob> out = new ArrayList<>();
        String url = apiUrl + "?limit=" + limit;
        log.info("[openintern] Fetching {}", url);
        String json = restTemplate.getForObject(url, String.class);
        if (json == null) return out;
        JsonNode root = objectMapper.readTree(json);
        JsonNode jobsNode = root.isArray() ? root : root.has("jobs") ? root.get("jobs") : root.has("data") ? root.get("data") : root;
        if (!jobsNode.isArray()) return out;
        for (JsonNode n : jobsNode) {
            try {
                out.add(normalize(n));
            } catch (Exception e) {
                log.warn("[openintern] skip job: {}", e.getMessage());
            }
        }
        log.info("[openintern] Fetched {} jobs", out.size());
        return out;
    }

    private CanonicalJob normalize(JsonNode n) throws Exception {
        String id = n.has("id") ? n.get("id").asText() : n.has("_id") ? n.get("_id").asText() : n.has("job_id") ? n.get("job_id").asText() : String.valueOf(n.hashCode());
        String title = n.has("title") ? n.get("title").asText() : n.has("role") ? n.get("role").asText() : n.has("position") ? n.get("position").asText() : "Internship";
        String company = n.has("company") ? (n.get("company").isTextual() ? n.get("company").asText() : n.get("company").has("name") ? n.get("company").get("name").asText() : "Unknown") : n.has("company_name") ? n.get("company_name").asText() : "Open Company";
        String location = n.has("location") ? n.get("location").asText("") : n.has("loc") ? n.get("loc").asText("") : "";
        String applyUrl = n.has("apply_url") ? n.get("apply_url").asText() : n.has("url") ? n.get("url").asText() : n.has("link") ? n.get("link").asText() : "https://openintern.dev";
        String description = n.has("description") ? n.get("description").asText("") : n.has("desc") ? n.get("desc").asText("") : "";
        String sourceUrl = applyUrl;
        boolean isRemote = location.toLowerCase().contains("remote") || title.toLowerCase().contains("remote");
        String hash = sha256(id + title + company + location);

        return CanonicalJob.builder()
                .source(getSource())
                .sourceId(id)
                .sourceUrl(sourceUrl)
                .applyUrl(applyUrl)
                .title(title.trim())
                .companyName(company)
                .location(location)
                .isRemote(isRemote)
                .workplaceType(isRemote ? "remote" : "onsite")
                .descriptionMd(description)
                .descriptionHtml(description)
                .employmentType("intern")
                .postedAt(Instant.now())
                .sourceRaw(n.toString())
                .contentHash(hash)
                .stipendCurrency("USD")
                .build();
    }

    private String sha256(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] h = md.digest(s.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : h) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) { return String.valueOf(s.hashCode()); }
    }
}
