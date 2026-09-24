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
public class AshbyAdapter implements SourceAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ingestion.ashby.enabled:true}")
    private boolean enabled;

    @Value("${app.ingestion.ashby.boards:linear,openai}")
    private String boardsCsv;

    @Override public String getSource() { return "ashby"; }

    @Override
    public List<CanonicalJob> fetch() throws Exception {
        if (!enabled) return List.of();
        List<CanonicalJob> out = new ArrayList<>();
        for (String raw : boardsCsv.split(",")) {
            String board = raw.trim();
            if (board.isEmpty()) continue;
            try {
                String url = String.format("https://api.ashbyhq.com/posting-api/job-board/%s?includeCompensation=false", board);
                log.info("[ashby:{}] Fetching {}", board, url);
                String json = restTemplate.getForObject(url, String.class);
                if (json == null) continue;
                JsonNode root = objectMapper.readTree(json);
                JsonNode jobs = root.has("jobs") ? root.get("jobs") : root;
                if (!jobs.isArray()) continue;
                for (JsonNode j : jobs) {
                    if (j.has("isListed") && !j.get("isListed").asBoolean(true)) continue;
                    try { out.add(normalize(j, board)); } catch (Exception e) { log.warn("[ashby:{}] skip: {}", board, e.getMessage()); }
                }
            } catch (Exception e) {
                log.warn("[ashby:{}] fetch failed: {}", board, e.getMessage());
            }
        }
        log.info("[ashby] Fetched {} jobs", out.size());
        return out;
    }

    private CanonicalJob normalize(JsonNode j, String board) throws Exception {
        String id = j.has("id") ? j.get("id").asText() : String.valueOf(j.hashCode());
        String title = j.has("title") ? j.get("title").asText("Untitled") : "Untitled";
        String location = j.has("location") ? j.get("location").asText("") : "";
        String department = j.has("department") ? j.get("department").asText("") : "";
        String team = j.has("team") ? j.get("team").asText("") : "";
        String applyUrl = j.has("applyUrl") ? j.get("applyUrl").asText() : j.has("jobUrl") ? j.get("jobUrl").asText() : "https://jobs.ashbyhq.com/" + board;
        String sourceUrl = j.has("jobUrl") ? j.get("jobUrl").asText(applyUrl) : applyUrl;
        String descHtml = j.has("descriptionHtml") ? j.get("descriptionHtml").asText("") : "";
        String descPlain = j.has("descriptionPlain") ? j.get("descriptionPlain").asText("") : "";
        boolean isRemote = j.has("isRemote") ? j.get("isRemote").asBoolean(false) : location.toLowerCase().contains("remote");
        String wt = "remote".equalsIgnoreCase(j.has("workplaceType") ? j.get("workplaceType").asText("") : "") ? "remote" : isRemote ? "remote" : "onsite";
        String emp = "fulltime";
        if (j.has("employmentType")) {
            String et = j.get("employmentType").asText("");
            if ("Intern".equalsIgnoreCase(et)) emp = "intern";
            else if ("PartTime".equalsIgnoreCase(et)) emp = "parttime";
            else if ("Contract".equalsIgnoreCase(et)) emp = "contract";
        } else if (title.toLowerCase().contains("intern")) emp = "intern";
        Instant posted = null;
        if (j.has("publishedAt") && !j.get("publishedAt").isNull()) {
            try { posted = Instant.parse(j.get("publishedAt").asText()); } catch (Exception ignored) {}
        }
        if (posted == null) posted = Instant.now();
        String hash = sha256("ashby-" + id + title + board);
        return CanonicalJob.builder()
                .source(getSource()).sourceId(id).sourceUrl(sourceUrl).applyUrl(applyUrl)
                .title(title.trim()).companyName(capitalize(board)).location(location)
                .isRemote(isRemote).workplaceType(wt).descriptionMd(descPlain.isEmpty() ? stripHtml(descHtml) : descPlain)
                .descriptionHtml(descHtml).departments(department.isEmpty() ? team : department)
                .employmentType(emp).postedAt(posted).sourceRaw(j.toString()).contentHash(hash).stipendCurrency("USD")
                .build();
    }

    private String stripHtml(String h) { return h == null ? "" : h.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim(); }
    private String capitalize(String s) { return s == null || s.isEmpty() ? s : s.substring(0,1).toUpperCase() + s.substring(1); }
    private String sha256(String s) {
        try { var md = MessageDigest.getInstance("SHA-256"); var h = md.digest(s.getBytes(StandardCharsets.UTF_8)); StringBuilder sb = new StringBuilder(); for (byte b : h) sb.append(String.format("%02x", b)); return sb.toString(); } catch (Exception e) { return String.valueOf(s.hashCode()); }
    }
}
