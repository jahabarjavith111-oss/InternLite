package com.internlite.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseUrlNormalizer implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = firstNonBlank(
                environment.getProperty("DB_URL"),
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("SPRING_DATASOURCE_URL")
        );
        if (rawUrl == null || rawUrl.isBlank()) {
            return;
        }
        rawUrl = rawUrl.trim();

        String jdbcUrl = toJdbcUrl(rawUrl);
        if (jdbcUrl == null) {
            return;
        }

        Map<String, Object> normalized = new HashMap<>();
        normalized.put("spring.datasource.url", jdbcUrl);

        Credentials credentials = extractCredentials(jdbcUrl);
        if (credentials != null) {
            normalized.put("spring.datasource.url", credentials.jdbcUrlWithoutCredentials());
            if (isBlank(environment.getProperty("DB_USERNAME"))
                    && isBlank(environment.getProperty("SPRING_DATASOURCE_USERNAME"))) {
                normalized.put("spring.datasource.username", credentials.username());
            }
            if (isBlank(environment.getProperty("DB_PASSWORD"))
                    && isBlank(environment.getProperty("SPRING_DATASOURCE_PASSWORD"))) {
                normalized.put("spring.datasource.password", credentials.password());
            }
        }

        environment.getPropertySources().addFirst(new MapPropertySource("renderDatabaseUrl", normalized));
    }

    private static String toJdbcUrl(String rawUrl) {
        if (rawUrl.startsWith("jdbc:")) {
            return rawUrl;
        }
        if (rawUrl.startsWith("postgresql://")) {
            return "jdbc:" + rawUrl;
        }
        if (rawUrl.startsWith("postgres://")) {
            return "jdbc:postgresql://" + rawUrl.substring("postgres://".length());
        }
        return null;
    }

    private static Credentials extractCredentials(String jdbcUrl) {
        try {
            URI uri = new URI(jdbcUrl.substring("jdbc:".length()));
            String userInfo = uri.getUserInfo();
            if (userInfo == null || userInfo.isBlank()) {
                return null;
            }
            String[] parts = userInfo.split(":", 2);
            String username = parts[0];
            String password = parts.length > 1 ? parts[1] : "";
            StringBuilder rebuilt = new StringBuilder("jdbc:postgresql://")
                    .append(uri.getHost());
            if (uri.getPort() != -1) {
                rebuilt.append(':').append(uri.getPort());
            }
            if (uri.getPath() != null && !uri.getPath().isBlank()) {
                rebuilt.append(uri.getPath());
            }
            if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                rebuilt.append('?').append(uri.getQuery());
            }
            return new Credentials(username, password, rebuilt.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record Credentials(String username, String password, String jdbcUrlWithoutCredentials) {
    }
}
