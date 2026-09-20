package com.internlite.repository;

import com.internlite.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, String> {
}
