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
public class SmartRecruitersAdapter implements SourceAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ingestion.smartrecruiters.enabled:true}")
    private boolean enabled;

    @Value("${app.ingestion.smartrecruiters.companies:smartrecruiters}")
    private String companiesCsv;

    @Override public String getSource() { return "smartrecruiters"; }

    @Override
    public List<CanonicalJob> fetch() throws Exception {
        if (!enabled) return List.of();
        List<CanonicalJob> out = new ArrayList<>();
        for (String raw : companiesCsv.split(",")) {
            String company = raw.trim();
            if (company.isEmpty()) continue;
            try {
                String url = String.format("https://api.smartrecruiters.com/v1/companies/%s/postings", company);
                log.info("[smartrecruiters:{}] Fetching {}", company, url);
                String json = restTemplate.getForObject(url, String.class);
                if (json == null) continue;
                JsonNode root = objectMapper.readTree(json);
                JsonNode jobs = root.has("content") ? root.get("content") : root.has("jobs") ? root.get("jobs") : root;
                if (!jobs.isArray()) continue;
                for (JsonNode j : jobs) {
                    try { out.add(normalize(j, company)); } catch (Exception e) { log.warn("[smartrecruiters:{}] skip: {}", company, e.getMessage()); }
                }
            } catch (Exception e) {
                log.warn("[smartrecruiters:{}] fetch failed: {}", company, e.getMessage());
            }
        }
        log.info("[smartrecruiters] Fetched {} jobs", out.size());
        return out;
    }

    private CanonicalJob normalize(JsonNode j, String company) throws Exception {
        String id = j.has("id") ? j.get("id").asText() : j.has("ref") ? j.get("ref").asText() : String.valueOf(j.hashCode());
        String title = j.has("name") ? j.get("name").asText("Untitled") : j.has("title") ? j.get("title").asText("Untitled") : "Untitled";
        String location = "";
        if (j.has("location")) {
            JsonNode loc = j.get("location");
            if (loc.has("city")) location = loc.get("city").asText("");
            if (loc.has("country") && !loc.get("country").asText("").isEmpty()) location += (location.isEmpty() ? "" : ", ") + loc.get("country").asText("");
            if (location.isEmpty() && loc.has("fullLocation")) location = loc.get("fullLocation").asText("");
        }
        if (location.isEmpty() && j.has("locationDisplay")) location = j.get("locationDisplay").asText("");
        String applyUrl = j.has("ref") ? "https://jobs.smartrecruiters.com/" + company + "/" + j.get("ref").asText() : j.has("applyUrl") ? j.get("applyUrl").asText() : "https://jobs.smartrecruiters.com/" + company;
        String desc = j.has("jobAd") ? j.get("jobAd").has("sections") ? j.get("jobAd").get("sections").toString() : j.get("jobAd").toString() : "";
        boolean isRemote = location.toLowerCase().contains("remote");
        String hash = sha256("smartrecruiters-" + id + title + company);
        Instant posted = Instant.now();
        if (j.has("releasedDate") && !j.get("releasedDate").isNull()) {
            try { posted = Instant.parse(j.get("releasedDate").asText()); } catch (Exception ignored) {}
        }
        return CanonicalJob.builder()
                .source(getSource()).sourceId(id).sourceUrl(applyUrl).applyUrl(applyUrl)
                .title(title.trim()).companyName(capitalize(company)).location(location)
                .isRemote(isRemote).workplaceType(isRemote ? "remote" : "onsite")
                .descriptionMd(stripHtml(desc)).descriptionHtml(desc)
                .employmentType(title.toLowerCase().contains("intern") ? "intern" : "fulltime")
                .postedAt(posted).sourceRaw(j.toString()).contentHash(hash).stipendCurrency("USD")
                .build();
    }

    private String stripHtml(String h) { return h == null ? "" : h.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim(); }
    private String capitalize(String s) { return s == null || s.isEmpty() ? s : s.substring(0,1).toUpperCase() + s.substring(1); }
    private String sha256(String s) {
        try { var md = MessageDigest.getInstance("SHA-256"); var h = md.digest(s.getBytes(StandardCharsets.UTF_8)); StringBuilder sb = new StringBuilder(); for (byte b : h) sb.append(String.format("%02x", b)); return sb.toString(); } catch (Exception e) { return String.valueOf(s.hashCode()); }
    }
}
