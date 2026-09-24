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
public class WorkableAdapter implements SourceAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ingestion.workable.enabled:true}")
    private boolean enabled;

    @Value("${app.ingestion.workable.accounts:runware,activtrak}")
    private String accountsCsv;

    @Override public String getSource() { return "workable"; }

    @Override
    public List<CanonicalJob> fetch() throws Exception {
        if (!enabled) return List.of();
        List<CanonicalJob> out = new ArrayList<>();
        for (String raw : accountsCsv.split(",")) {
            String account = raw.trim();
            if (account.isEmpty()) continue;
            try {
                // Workable public widget API (no key needed):
                // https://apply.workable.com/api/v1/widget/accounts/{account}?details=true
                // returns { "name": "...", "jobs": [...] }. details=true brings descriptions.
                String url = String.format("https://apply.workable.com/api/v1/widget/accounts/%s?details=true", account);
                log.info("[workable:{}] Fetching {}", account, url);
                String json = restTemplate.getForObject(url, String.class);
                if (json == null) continue;
                JsonNode root = objectMapper.readTree(json);
                String boardName = root.has("name") && !root.get("name").isNull() ? root.get("name").asText(account) : account;
                JsonNode jobs = root.has("jobs") ? root.get("jobs") : root.has("results") ? root.get("results") : root;
                if (!jobs.isArray()) continue;
                for (JsonNode j : jobs) {
                    try { out.add(normalize(j, account, boardName)); } catch (Exception e) { log.warn("[workable:{}] skip: {}", account, e.getMessage()); }
                }
            } catch (Exception e) {
                log.warn("[workable:{}] fetch failed: {}", account, e.getMessage());
            }
        }
        log.info("[workable] Fetched {} jobs", out.size());
        return out;
    }

    private CanonicalJob normalize(JsonNode j, String account, String boardName) throws Exception {
        String id = j.has("shortcode") ? j.get("shortcode").asText() : j.has("id") ? j.get("id").asText() : String.valueOf(j.hashCode());
        String title = j.has("title") ? j.get("title").asText("Untitled") : "Untitled";
        // Widget shape: city/state/country top-level fields (+ optional locations[]).
        String location = joinNonBlank(
                textOrEmpty(j, "city"),
                textOrEmpty(j, "state"),
                textOrEmpty(j, "country"));
        if (location.isEmpty() && j.has("location")) {
            JsonNode loc = j.get("location");
            if (loc.isTextual()) location = loc.asText("");
            else if (loc.has("city")) location = loc.get("city").asText("") + (loc.has("country") ? ", " + loc.get("country").asText("") : "");
        }
        String applyUrl = j.has("application_url") ? j.get("application_url").asText() : j.has("url") ? j.get("url").asText() : "https://apply.workable.com/" + account + "/j/" + id;
        String desc = j.has("description") ? j.get("description").asText("") : j.has("full_description") ? j.get("full_description").asText("") : "";
        boolean isRemote = j.has("telecommuting") ? j.get("telecommuting").asBoolean(false) : location.toLowerCase().contains("remote");
        String department = j.has("department") && !j.get("department").isNull() ? j.get("department").asText("") : j.has("function") ? j.get("function").asText("") : "";
        String hash = sha256("workable-" + id + title + account);
        Instant posted = parseDate(j, "published_on", "created_at");
        return CanonicalJob.builder()
                .source(getSource()).sourceId(id).sourceUrl(applyUrl).applyUrl(applyUrl)
                .title(title.trim()).companyName(boardName != null ? boardName : capitalize(account)).location(location)
                .isRemote(isRemote).workplaceType(isRemote ? "remote" : "onsite")
                .descriptionMd(stripHtml(desc)).descriptionHtml(desc)
                .departments(department)
                .employmentType(detectEmploymentType(title, j.has("employment_type") ? j.get("employment_type").asText("") : ""))
                .postedAt(posted).sourceRaw(j.toString()).contentHash(hash).stipendCurrency("USD")
                .build();
    }

    private String detectEmploymentType(String title, String employmentType) {
        String t = (title + " " + employmentType).toLowerCase();
        if (t.contains("intern")) return "intern";
        if (t.contains("contract")) return "contract";
        if (t.contains("part")) return "parttime";
        return "fulltime";
    }

    private Instant parseDate(JsonNode j, String... fields) {
        for (String f : fields) {
            if (j.has(f) && !j.get(f).isNull()) {
                String v = j.get(f).asText("").trim();
                if (v.isEmpty()) continue;
                try {
                    if (v.length() == 10) return java.time.LocalDate.parse(v).atStartOfDay(java.time.ZoneOffset.UTC).toInstant();
                    return Instant.parse(v);
                } catch (Exception ignored) {}
            }
        }
        return Instant.now();
    }

    private String textOrEmpty(JsonNode j, String field) {
        return (j.has(field) && !j.get(field).isNull()) ? j.get(field).asText("").trim() : "";
    }

    private String joinNonBlank(String... parts) {
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p != null && !p.isBlank()) {
                if (sb.length() > 0) sb.append(", ");
                sb.append(p.trim());
            }
        }
        return sb.toString();
    }

    private String stripHtml(String h) { return h == null ? "" : h.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim(); }
    private String capitalize(String s) { return s == null || s.isEmpty() ? s : s.substring(0,1).toUpperCase() + s.substring(1); }
    private String sha256(String s) {
        try { var md = MessageDigest.getInstance("SHA-256"); var h = md.digest(s.getBytes(StandardCharsets.UTF_8)); StringBuilder sb = new StringBuilder(); for (byte b : h) sb.append(String.format("%02x", b)); return sb.toString(); } catch (Exception e) { return String.valueOf(s.hashCode()); }
    }
}
