package com.internlite.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Converts unhandled service errors into consistent 500 responses
 * with the error message instead of a propagated exception.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntime(RuntimeException e) {
        log.error("Request failed: {}", e.getMessage(), e);
        String msg = e.getMessage() != null ? e.getMessage() : "Internal error";
        return ResponseEntity.status(500).body(msg);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleOther(Exception e) {
        log.error("Request failed (checked): {}", e.getMessage(), e);
        String msg = e.getMessage() != null ? e.getMessage() : "Internal error";
        return ResponseEntity.status(500).body(msg);
    }

    @ExceptionHandler(DuplicateApplicationException.class)
    public ResponseEntity<String> handleDuplicate(DuplicateApplicationException e) {
        return ResponseEntity.status(409).body(e.getMessage());
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(
            org.springframework.web.bind.MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .reduce((a, b) -> a + "; " + b)
            .orElse("Validation failed");
        return ResponseEntity.badRequest().body(msg);
    }
}
