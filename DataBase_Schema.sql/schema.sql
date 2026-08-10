CREATE DATABASE internlite;
USE internlite;

-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('STUDENT', 'RECRUITER', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. STUDENTS
-- ============================================================

CREATE TABLE students (
    student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    college VARCHAR(150),
    degree VARCHAR(100),
    branch VARCHAR(100),
    graduation_year YEAR,
    location VARCHAR(100),
    bio TEXT,

    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 3. RECRUITERS
-- ============================================================

CREATE TABLE recruiters (
    recruiter_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    designation VARCHAR(100),
    company_id BIGINT,
    
    CONSTRAINT fk_recruiter_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 4. COMPANIES
-- ============================================================

CREATE TABLE companies (
    company_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    location VARCHAR(150),
    logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. CATEGORIES
-- ============================================================

CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);


-- ============================================================
-- 6. INTERNSHIPS
-- ============================================================

CREATE TABLE internships (
    internship_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150),
    work_type ENUM('REMOTE', 'ONSITE', 'HYBRID') NOT NULL,
    duration VARCHAR(50),
    stipend DECIMAL(10,2),
    required_skills VARCHAR(500),
    start_date DATE,
    application_deadline DATE,
    status ENUM('OPEN', 'CLOSED', 'DRAFT') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_internship_company
        FOREIGN KEY (company_id)
        REFERENCES companies(company_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_internship_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 7. SKILLS
-- ============================================================

CREATE TABLE skills (
    skill_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE
);


-- ============================================================
-- 8. STUDENT SKILLS
-- ============================================================

CREATE TABLE student_skills (
    student_skill_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,

    CONSTRAINT fk_student_skill_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_student_skill_skill
        FOREIGN KEY (skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE,

    UNIQUE (student_id, skill_id)
);


-- ============================================================
-- 9. RESUMES
-- ============================================================

CREATE TABLE resumes (
    resume_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    resume_name VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_resume_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 10. APPLICATIONS
-- ============================================================

CREATE TABLE applications (
    application_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    internship_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    resume_id BIGINT,
    cover_letter TEXT,
    status ENUM(
        'APPLIED',
        'SHORTLISTED',
        'INTERVIEW',
        'SELECTED',
        'REJECTED',
        'WITHDRAWN'
    ) DEFAULT 'APPLIED',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_application_internship
        FOREIGN KEY (internship_id)
        REFERENCES internships(internship_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_application_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_application_resume
        FOREIGN KEY (resume_id)
        REFERENCES resumes(resume_id)
        ON DELETE SET NULL,

    UNIQUE (internship_id, student_id)
);


-- ============================================================
-- 11. SAVED INTERNSHIPS
-- ============================================================

CREATE TABLE saved_internships (
    saved_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    internship_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_saved_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_saved_internship
        FOREIGN KEY (internship_id)
        REFERENCES internships(internship_id)
        ON DELETE CASCADE,

    UNIQUE (student_id, internship_id)
);


-- ============================================================
-- 12. INTERVIEWS
-- ============================================================

CREATE TABLE interviews (
    interview_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    interview_type ENUM('ONLINE', 'OFFLINE') NOT NULL,
    scheduled_at DATETIME NOT NULL,
    meeting_link VARCHAR(255),
    interviewer_name VARCHAR(150),
    status ENUM(
        'SCHEDULED',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'SCHEDULED',
    feedback TEXT,

    CONSTRAINT fk_interview_application
        FOREIGN KEY (application_id)
        REFERENCES applications(application_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT,
    message VARCHAR(500) NOT NULL,
    type ENUM(
        'APPLICATION',
        'INTERVIEW',
        'INTERNSHIP',
        'SYSTEM'
    ) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification_application
        FOREIGN KEY (application_id)
        REFERENCES applications(application_id)
        ON DELETE SET NULL
);


-- ============================================================
-- 14. APPLICATION STATUS HISTORY
-- ============================================================

CREATE TABLE application_status_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    status ENUM(
        'APPLIED',
        'SHORTLISTED',
        'INTERVIEW',
        'SELECTED',
        'REJECTED',
        'WITHDRAWN'
    ) NOT NULL,
    changed_by BIGINT,
    notes VARCHAR(500),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_application
        FOREIGN KEY (application_id)
        REFERENCES applications(application_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);


-- ============================================================
-- 15. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    details VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);