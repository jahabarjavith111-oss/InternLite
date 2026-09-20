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
public class GreenhouseAdapter implements SourceAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ingestion.greenhouse.enabled:true}")
    private boolean enabled;

    @Value("${app.ingestion.greenhouse.tokens:stripe,airbnb,coinbase}")
    private String tokensCsv;

    @Override
    public String getSource() { return "greenhouse"; }

    @Override
    public List<CanonicalJob> fetch() throws Exception {
        if (!enabled) return List.of();
        List<CanonicalJob> out = new ArrayList<>();
        String[] tokens = tokensCsv.split(",");
        for (String raw : tokens) {
            String token = raw.trim();
            if (token.isEmpty()) continue;
            try {
                String url = String.format("https://boards-api.greenhouse.io/v1/boards/%s/jobs?content=true", token);
                log.info("[greenhouse:{}] Fetching {}", token, url);
                String json = restTemplate.getForObject(url, String.class);
                if (json == null) continue;
                JsonNode root = objectMapper.readTree(json);
                JsonNode jobs = root.has("jobs") ? root.get("jobs") : root;
                if (!jobs.isArray()) continue;
                for (JsonNode j : jobs) {
                    try { out.add(normalize(j, token)); } catch (Exception e) { log.warn("[greenhouse:{}] skip: {}", token, e.getMessage()); }
                }
            } catch (Exception e) {
                log.warn("[greenhouse:{}] fetch failed: {}", token, e.getMessage());
            }
        }
        log.info("[greenhouse] Fetched {} jobs", out.size());
        return out;
    }

    private CanonicalJob normalize(JsonNode j, String token) throws Exception {
        String id = j.has("id") ? j.get("id").asText() : String.valueOf(j.hashCode());
        String title = j.has("title") ? j.get("title").asText("Untitled") : "Untitled";
        String company = token;
        String location = "";
        if (j.has("location") && j.get("location").has("name")) location = j.get("location").get("name").asText("");
        // check metadata for better location
        if (j.has("metadata") && j.get("metadata").isArray()) {
            for (JsonNode m : j.get("metadata")) {
                if (m.has("name") && "Job Posting Location".equalsIgnoreCase(m.get("name").asText("")) && m.has("value")) {
                    String v = m.get("value").isArray() ? m.get("value").get(0).asText("") : m.get("value").asText("");
                    if (!v.isEmpty()) { location = v; break; }
                }
            }
        }
        String applyUrl = j.has("absolute_url") ? j.get("absolute_url").asText() : "https://boards.greenhouse.io/" + token + "/jobs/" + id;
        String content = j.has("content") ? j.get("content").asText("") : "";
        boolean isRemote = location.toLowerCase().contains("remote") || "remote".equalsIgnoreCase(j.has("location") ? j.get("location").get("name").asText("") : "");
        String workplace = isRemote ? "remote" : location.toLowerCase().contains("hybrid") ? "hybrid" : "onsite";
        String hash = sha256("greenhouse-" + id + title + location);
        Instant posted = null;
        if (j.has("updated_at") && !j.get("updated_at").isNull()) {
            try { posted = Instant.parse(j.get("updated_at").asText()); } catch (Exception ignored) {}
        }
        if (posted == null) posted = Instant.now();

        return CanonicalJob.builder()
                .source(getSource())
                .sourceId(id)
                .sourceUrl("https://boards.greenhouse.io/" + token + "/jobs/" + id)
                .applyUrl(applyUrl)
                .title(title.trim())
                .companyName(capitalize(token))
                .location(location)
                .isRemote(isRemote)
                .workplaceType(workplace)
                .descriptionMd(stripHtml(content))
                .descriptionHtml(content)
                .employmentType(detectEmploymentType(title))
                .postedAt(posted)
                .sourceRaw(j.toString())
                .contentHash(hash)
                .stipendCurrency("USD")
                .build();
    }

    private String detectEmploymentType(String title) {
        String t = title.toLowerCase();
        if (t.contains("intern")) return "intern";
        if (t.contains("contract")) return "contract";
        if (t.contains("part")) return "parttime";
        return "fulltime";
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0,1).toUpperCase() + s.substring(1);
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
