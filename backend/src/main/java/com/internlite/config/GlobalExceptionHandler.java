package com.internlite.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Converts unhandled service errors into consistent 500 responses
 * with the error message instead of a propagated exception.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntime(RuntimeException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Internal error";
        return ResponseEntity.status(500).body(msg);
    }
}
