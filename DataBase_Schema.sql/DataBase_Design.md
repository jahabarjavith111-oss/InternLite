# 💼 InternLite – Internship Discovery & Application Platform

# Database Design

The system uses a relational MySQL database to store users, students,
recruiters, companies, internships, skills, resumes, applications,
interviews, saved internships, and notifications.

---

## 1. Users Table

### Purpose

Stores the basic account details of all users in the platform.

| Column       | Type         | Key    |
| ------------ | ------------ | ------ |
| user_id      | BIGINT       | PK     |
| name         | VARCHAR(100) |        |
| email        | VARCHAR(150) | UNIQUE |
| password     | VARCHAR(255) |        |
| phone        | VARCHAR(15)  |        |
| role         | VARCHAR(20)  |        |
| created_at   | TIMESTAMP    |        |

### Used For

- User registration and login
- User identification
- Role management
- Contact information
- Authentication

---

## 2. Students Table

### Purpose

Stores information related specifically to students looking for internships.

| Column           | Type          | Key |
| ---------------- | ------------- | --- |
| student_id       | BIGINT        | PK  |
| user_id          | BIGINT        | FK  |
| college          | VARCHAR(150)  |     |
| degree           | VARCHAR(100)  |     |
| branch           | VARCHAR(100)  |     |
| graduation_year  | INT           |     |
| location         | VARCHAR(100)  |     |
| bio              | TEXT          |     |

### Used For

- Storing student profile
- Managing education details
- Storing college information
- Managing student location
- Building student profiles

---

## 3. Recruiters Table

### Purpose

Stores information related to recruiters who manage internship opportunities.

| Column       | Type         | Key |
| ------------ | ------------ | --- |
| recruiter_id | BIGINT       | PK  |
| user_id      | BIGINT       | FK  |
| company_id   | BIGINT       | FK  |
| designation  | VARCHAR(100) |     |

### Used For

- Managing recruiter profiles
- Connecting recruiters with companies
- Posting internships
- Managing applications
- Shortlisting candidates

---

## 4. Companies Table

### Purpose

Stores information about companies that provide internship opportunities.

| Column         | Type         | Key    |
| -------------- | ------------ | ------ |
| company_id     | BIGINT       | PK     |
| company_name   | VARCHAR(150) |        |
| description    | TEXT         |        |
| industry       | VARCHAR(100) |        |
| website        | VARCHAR(255) |        |
| location       | VARCHAR(150) |        |
| logo           | VARCHAR(255) |        |
| created_at     | TIMESTAMP    |        |

### Used For

- Storing company information
- Displaying company profiles
- Connecting recruiters with companies
- Managing internship providers

---

## 5. Categories Table

### Purpose

Stores different categories of internships available on the platform.

| Column        | Type         | Key |
| ------------- | ------------ | --- |
| category_id   | BIGINT       | PK  |
| category_name | VARCHAR(100) |     |
| description   | VARCHAR(255) |     |

### Examples

- Software Development
- Data Science
- Artificial Intelligence
- Machine Learning
- Cybersecurity
- Cloud Computing
- Web Development
- Mobile Development
- UI/UX Design

### Used For

- Categorizing internships
- Filtering internship opportunities
- Improving internship search
- Organizing internship listings

---

## 6. Internships Table ⭐

### Purpose

Stores internship opportunities posted by companies and recruiters.

| Column               | Type          | Key |
| -------------------- | ------------- | --- |
| internship_id        | BIGINT        | PK  |
| company_id           | BIGINT        | FK  |
| category_id          | BIGINT        | FK  |
| title                | VARCHAR(200)  |     |
| description          | TEXT          |     |
| location             | VARCHAR(150)  |     |
| work_type            | VARCHAR(20)   |     |
| duration             | VARCHAR(50)   |     |
| stipend              | DECIMAL(10,2) |     |
| required_skills      | VARCHAR(500)  |     |
| start_date           | DATE          |     |
| application_deadline | DATE          |     |
| status               | VARCHAR(20)   |     |
| created_at           | TIMESTAMP     |     |

### Used For

- Posting internship opportunities
- Displaying internship details
- Storing required skills
- Managing stipend information
- Managing internship duration
- Managing application deadlines
- Searching and filtering internships

> **This is one of the most important tables in InternLite because it stores the actual internship opportunities.**

---

## 7. Skills Table

### Purpose

Stores technical and professional skills used by students and internships.

| Column      | Type         | Key    |
| ----------- | ------------ | ------ |
| skill_id    | BIGINT       | PK     |
| skill_name  | VARCHAR(100) | UNIQUE |

### Examples

- Java
- Spring Boot
- React
- Python
- JavaScript
- MySQL
- AWS
- Docker
- Git

### Used For

- Managing student skills
- Matching students with internships
- Supporting skill-based recommendations
- Building candidate profiles

---

## 8. Student Skills Table

### Purpose

Connects students with their technical and professional skills.

| Column       | Type   | Key |
| ------------ | ------ | --- |
| student_id   | BIGINT | FK  |
| skill_id     | BIGINT | FK  |

### Used For

- Storing multiple skills for each student
- Finding students with specific skills
- Supporting internship matching
- Supporting future AI recommendations

### Relationship

```text
STUDENTS (M) ─────── (M) SKILLS
              │
              ▼
        STUDENT_SKILLS

This table creates a many-to-many relationship between students and skills.

9. Resumes Table
Purpose

Stores resume information uploaded by students.

Column	Type	Key
resume_id	BIGINT	PK
student_id	BIGINT	FK
resume_name	VARCHAR(150)	
file_path	VARCHAR(255)	
is_default	BOOLEAN	
uploaded_at	TIMESTAMP	
Used For
Uploading student resumes
Managing multiple resumes
Selecting a default resume
Attaching resumes to applications
10. Applications Table ⭐
Purpose

Stores internship applications submitted by students.

Column	Type	Key
application_id	BIGINT	PK
internship_id	BIGINT	FK
student_id	BIGINT	FK
resume_id	BIGINT	FK
cover_letter	TEXT	
status	VARCHAR(20)	
applied_at	TIMESTAMP	
Application Status
APPLIED
   ↓
SHORTLISTED
   ↓
INTERVIEW
   ↓
SELECTED

Alternative:

APPLIED
   ↓
REJECTED
Used For
Applying for internships
Tracking applications
Managing candidate status
Shortlisting students
Tracking recruitment progress

This is one of the core tables because it connects students with internship opportunities.

11. Saved Internships Table
Purpose

Stores internships bookmarked by students for future reference.

Column	Type	Key
saved_id	BIGINT	PK
student_id	BIGINT	FK
internship_id	BIGINT	FK
saved_at	TIMESTAMP
Used For
Saving interesting internships
Viewing bookmarked internships
Applying later
Managing student preferences
Relationship
STUDENTS (M)
     │
     ▼
SAVED_INTERNSHIPS
     │
     ▼
INTERNSHIPS (M)
12. Interviews Table
Purpose

Stores interview schedules for shortlisted internship applicants.

Column	Type	Key
interview_id	BIGINT	PK
application_id	BIGINT	FK
interview_type	VARCHAR(20)	
scheduled_at	DATETIME	
meeting_link	VARCHAR(255)	
interviewer_name	VARCHAR(150)	
status	VARCHAR(20)	
feedback	TEXT	
Interview Status
SCHEDULED
COMPLETED
CANCELLED
Used For
Scheduling interviews
Managing interview details
Providing online meeting links
Recording interview feedback
Tracking interview status
13. Application Status History Table
Purpose

Stores the complete status history of an internship application.

Column	Type	Key
history_id	BIGINT	PK
application_id	BIGINT	FK
status	VARCHAR(20)	
changed_by	BIGINT	FK
notes	VARCHAR(500)	
changed_at	TIMESTAMP
Example
APPLIED
   ↓
SHORTLISTED
   ↓
INTERVIEW
   ↓
SELECTED
Used For
Tracking application progress
Maintaining application history
Recording status changes
Providing recruitment transparency
14. Notifications Table
Purpose

Stores notifications sent to students, recruiters, and administrators.

Column	Type	Key
notification_id	BIGINT	PK
user_id	BIGINT	FK
message	VARCHAR(500)	
type	VARCHAR(50)	
is_read	BOOLEAN	
created_at	TIMESTAMP
Notification Types
APPLICATION
INTERVIEW
INTERNSHIP
SYSTEM
Used For
Application updates
Interview notifications
New internship alerts
Shortlisting notifications
Selection/rejection notifications
System notifications
15. Audit Logs Table
Purpose

Stores important activities performed on the InternLite platform.

Column	Type	Key
log_id	BIGINT	PK
user_id	BIGINT	FK
action	VARCHAR(100)	
description	VARCHAR(500)	
created_at	TIMESTAMP
Used For
Tracking user activity
Monitoring important operations
Security auditing
Debugging system activities
Examples
USER_LOGIN
INTERNSHIP_CREATED
INTERNSHIP_UPDATED
APPLICATION_SUBMITTED
APPLICATION_SHORTLISTED
INTERVIEW_SCHEDULED
APPLICATION_SELECTED
APPLICATION_REJECTED
🔗 Database Relationships
USERS
  │
  ├──────────────► STUDENTS
  │                    │
  │                    ├────────► RESUMES
  │                    │
  │                    ├────────► STUDENT_SKILLS ◄──────── SKILLS
  │                    │
  │                    ├────────► APPLICATIONS
  │                    │                  │
  │                    │                  ├────────► INTERVIEWS
  │                    │                  │
  │                    │                  └────────► APPLICATION_STATUS_HISTORY
  │                    │
  │                    └────────► SAVED_INTERNSHIPS
  │                                      │
  │                                      ▼
  │                                 INTERNSHIPS
  │
  ├──────────────► RECRUITERS
  │                    │
  │                    ▼
  │                COMPANIES
  │                    │
  │                    └────────► INTERNSHIPS
  │                                      │
  │                                      ▼
  │                                APPLICATIONS
  │
  └──────────────► NOTIFICATIONS
  │
  └──────────────► AUDIT_LOGS

CATEGORIES
     │
     └──────────────► INTERNSHIPS
🔄 Student Application Flow
Student Registration
        ↓
Create Profile
        ↓
Add Skills
        ↓
Upload Resume
        ↓
Browse Internships
        ↓
Search / Filter
        ↓
Save Internship
        ↓
Apply
        ↓
Application Created
        ↓
Recruiter Reviews Application
        ↓
Shortlist
        ↓
Schedule Interview
        ↓
Interview
        ↓
      ┌──────────────┐
      │              │
      ▼              ▼
  SELECTED        REJECTED
🏢 Recruiter Flow
Recruiter Registration
        ↓
Create Company Profile
        ↓
Post Internship
        ↓
Receive Applications
        ↓
Review Candidates
        ↓
Shortlist Candidate
        ↓
Schedule Interview
        ↓
Update Application Status
        ↓
SELECT / REJECT
🤖 Future AI Matching Flow
Student Profile
      +
Student Skills
      +
Resume
      ↓
AI Matching Engine
      ↓
Internship Requirements
      ↓
Match Score
      ↓
Recommended Internships

Example:

Student Skills:

Java
Spring Boot
MySQL
React

        ↓

Internship:

Java Full Stack Developer Intern

        ↓

Match Score:

92%
🔐 Security

The database will be accessed through the Spring Boot backend.

Security mechanisms:

Password hashing
JWT authentication
Role-based authorization
Spring Security
Input validation
JPA/Hibernate
API authorization
Audit logging

Passwords must never be stored as plain text.

🛠 Technology Stack
Frontend
   ↓
React.js
   ↓
REST API
   ↓
Java Spring Boot
   ↓
Spring Data JPA
   ↓
Hibernate
   ↓
MySQL