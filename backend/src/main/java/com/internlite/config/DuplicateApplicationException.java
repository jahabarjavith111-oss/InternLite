package com.internlite.config;

/** Thrown when a student applies twice -> mapped to HTTP 409. */
public class DuplicateApplicationException extends RuntimeException {
    public DuplicateApplicationException(String message) {
        super(message);
    }
}
