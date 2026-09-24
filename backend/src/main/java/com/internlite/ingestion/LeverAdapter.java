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
public class LeverAdapter implements SourceAdapter {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.ingestion.lever.enabled:true}")
    private boolean enabled;

    @Value("${app.ingestion.lever.slugs:portcast}")
    private String slugsCsv;

    @Override
    public String getSource() { return "lever"; }

    @Override
    public List<CanonicalJob> fetch() throws Exception {
        if (!enabled) return List.of();
        List<CanonicalJob> out = new ArrayList<>();
        String[] slugs = slugsCsv.split(",");
        for (String raw : slugs) {
            String slug = raw.trim();
            if (slug.isEmpty()) continue;
            try {
                // US host first, fallback EU if 404
                List<CanonicalJob> fetched = fetchSlug(slug, "https://api.lever.co/v0/postings/" + slug);
                if (fetched.isEmpty()) {
                    fetched = fetchSlug(slug, "https://api.eu.lever.co/v0/postings/" + slug);
                }
                out.addAll(fetched);
            } catch (Exception e) {
                log.warn("[lever:{}] fetch failed: {}", slug, e.getMessage());
            }
        }
        log.info("[lever] Fetched {} jobs", out.size());
        return out;
    }

    private List<CanonicalJob> fetchSlug(String slug, String base) throws Exception {
        List<CanonicalJob> out = new ArrayList<>();
        int skip = 0;
        int limit = 100;
        while (true) {
            String url = base + "?mode=json&skip=" + skip + "&limit=" + limit;
            log.info("[lever:{}] Fetching {}", slug, url);
            String json = restTemplate.getForObject(url, String.class);
            if (json == null) break;
            JsonNode arr = objectMapper.readTree(json);
            if (!arr.isArray() || arr.size() == 0) break;
            for (JsonNode n : arr) {
                try { out.add(normalize(n, slug)); } catch (Exception e) { log.warn("[lever:{}] skip: {}", slug, e.getMessage()); }
            }
            if (arr.size() < limit) break;
            skip += limit;
            if (skip > 1000) break; // safety cap per slug
        }
        return out;
    }

    private CanonicalJob normalize(JsonNode n, String slug) throws Exception {
        String id = n.has("id") ? n.get("id").asText() : String.valueOf(n.hashCode());
        String title = n.has("text") ? n.get("text").asText("Untitled") : n.has("title") ? n.get("title").asText("Untitled") : "Untitled";
        String hostedUrl = n.has("hostedUrl") ? n.get("hostedUrl").asText() : n.has("applyUrl") ? n.get("applyUrl").asText() : "https://jobs.lever.co/" + slug + "/" + id;
        String applyUrl = n.has("applyUrl") ? n.get("applyUrl").asText(hostedUrl) : hostedUrl;
        JsonNode cats = n.has("categories") ? n.get("categories") : null;
        String location = cats != null && cats.has("location") ? cats.get("location").asText("") : "";
        String team = cats != null && cats.has("team") ? cats.get("team").asText("") : "";
        String workplace = n.has("workplaceType") ? n.get("workplaceType").asText("") : "";
        boolean isRemote = "remote".equalsIgnoreCase(workplace) || location.toLowerCase().contains("remote");
        String wt = isRemote ? "remote" : "hybrid".equalsIgnoreCase(workplace) ? "hybrid" : "onsite";
        String desc = n.has("description") ? n.get("description").asText("") : n.has("descriptionPlain") ? n.get("descriptionPlain").asText("") : "";
        // Lever description is HTML sometimes
        String descMd = stripHtml(desc);
        Instant posted = null;
        if (n.has("createdAt") && n.get("createdAt").isNumber()) {
            try { posted = Instant.ofEpochMilli(n.get("createdAt").asLong()); } catch (Exception ignored) {}
        }
        if (posted == null) posted = Instant.now();
        String hash = sha256("lever-" + id + title + location);

        return CanonicalJob.builder()
                .source(getSource())
                .sourceId(id)
                .sourceUrl(hostedUrl)
                .applyUrl(applyUrl)
                .title(title.trim())
                .companyName(capitalize(slug))
                .location(location)
                .isRemote(isRemote)
                .workplaceType(wt)
                .descriptionMd(descMd)
                .descriptionHtml(desc)
                .departments(team)
                .employmentType(detectEmploymentType(title))
                .postedAt(posted)
                .sourceRaw(n.toString())
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
