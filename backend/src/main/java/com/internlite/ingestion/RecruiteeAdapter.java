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
public class RecruiteeAdapter implements SourceAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ingestion.recruitee.enabled:true}")
    private boolean enabled;

    @Value("${app.ingestion.recruitee.companies:vandebron}")
    private String companiesCsv;

    @Override public String getSource() { return "recruitee"; }

    @Override
    public List<CanonicalJob> fetch() throws Exception {
        if (!enabled) return List.of();
        List<CanonicalJob> out = new ArrayList<>();
        for (String raw : companiesCsv.split(",")) {
            String company = raw.trim();
            if (company.isEmpty()) continue;
            try {
                String url = String.format("https://%s.recruitee.com/api/offers", company);
                log.info("[recruitee:{}] Fetching {}", company, url);
                String json = restTemplate.getForObject(url, String.class);
                if (json == null) continue;
                JsonNode root = objectMapper.readTree(json);
                JsonNode jobs = root.has("offers") ? root.get("offers") : root.has("jobs") ? root.get("jobs") : root;
                if (!jobs.isArray()) continue;
                for (JsonNode j : jobs) {
                    try { out.add(normalize(j, company)); } catch (Exception e) { log.warn("[recruitee:{}] skip: {}", company, e.getMessage()); }
                }
            } catch (Exception e) {
                log.warn("[recruitee:{}] fetch failed: {}", company, e.getMessage());
            }
        }
        log.info("[recruitee] Fetched {} jobs", out.size());
        return out;
    }

    private CanonicalJob normalize(JsonNode j, String company) throws Exception {
        String id = j.has("id") ? j.get("id").asText() : j.has("slug") ? j.get("slug").asText() : String.valueOf(j.hashCode());
        String title = j.has("title") ? j.get("title").asText("Untitled") : j.has("name") ? j.get("name").asText("Untitled") : "Untitled";
        // Verified public shape: city/country/country_code, careers_url, company_name,
        // remote/hybrid/on_site booleans, published_at "yyyy-MM-dd HH:mm:ss UTC".
        String location = joinNonBlank(
                (j.has("city") && !j.get("city").isNull()) ? j.get("city").asText("") : "",
                (j.has("country") && !j.get("country").isNull()) ? j.get("country").asText("") : "");
        if (location.isEmpty() && j.has("location") && !j.get("location").isNull()) location = j.get("location").asText("");
        String companyName = (j.has("company_name") && !j.get("company_name").isNull()) ? j.get("company_name").asText(company) : company;
        if (companyName.isBlank()) companyName = capitalize(company);
        String applyUrl = (j.has("careers_apply_url") && !j.get("careers_apply_url").isNull()) ? j.get("careers_apply_url").asText()
                : (j.has("careers_url") && !j.get("careers_url").isNull()) ? j.get("careers_url").asText()
                : j.has("url") ? j.get("url").asText() : "https://" + company + ".recruitee.com/o/" + id;
        String desc = j.has("description") ? j.get("description").asText("") : "";
        boolean isRemote = (j.has("remote") && j.get("remote").isBoolean()) ? j.get("remote").asBoolean(false) : location.toLowerCase().contains("remote");
        boolean isHybrid = (j.has("hybrid") && j.get("hybrid").isBoolean()) && j.get("hybrid").asBoolean(false);
        String department = (j.has("department") && !j.get("department").isNull()) ? j.get("department").asText("") : "";
        String empCode = (j.has("employment_type_code") && !j.get("employment_type_code").isNull()) ? j.get("employment_type_code").asText("") : "";
        String tags = "";
        if (j.has("tags") && j.get("tags").isArray()) {
            StringBuilder tb = new StringBuilder();
            for (JsonNode t : j.get("tags")) {
                if (t.isTextual()) { if (tb.length() > 0) tb.append(","); tb.append(t.asText()); }
            }
            tags = tb.toString();
        }
        String hash = sha256("recruitee-" + id + title + company);
        Instant posted = parseDate(j);
        return CanonicalJob.builder()
                .source(getSource()).sourceId(id).sourceUrl(applyUrl).applyUrl(applyUrl)
                .title(title.trim()).companyName(companyName).location(location)
                .isRemote(isRemote).workplaceType(isRemote ? "remote" : isHybrid ? "hybrid" : "onsite")
                .descriptionMd(stripHtml(desc)).descriptionHtml(desc)
                .departments(department).tags(tags)
                .employmentType(detectEmploymentType(title, empCode))
                .postedAt(posted).sourceRaw(j.toString()).contentHash(hash).stipendCurrency("USD")
                .build();
    }

    private String detectEmploymentType(String title, String empCode) {
        String t = (title + " " + empCode).toLowerCase();
        if (t.contains("intern")) return "intern";
        if (t.contains("contract")) return "contract";
        if (t.contains("part")) return "parttime";
        return "fulltime";
    }

    private Instant parseDate(JsonNode j) {
        for (String f : new String[]{"published_at", "created_at", "updated_at"}) {
            if (j.has(f) && !j.get(f).isNull()) {
                String v = j.get(f).asText("").trim();
                if (v.isEmpty()) continue;
                try {
                    // Recruitee format: "2026-08-14 08:23:10 UTC"
                    java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z").withZone(java.time.ZoneOffset.UTC);
                    return java.time.ZonedDateTime.parse(v, fmt).toInstant();
                } catch (Exception ignored) {}
                try { return Instant.parse(v); } catch (Exception ignored) {}
            }
        }
        return Instant.now();
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
