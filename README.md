# InternLite - Internship Discovery & Application Platform

A full-stack internship marketplace connecting students with recruiters.

## Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | React.js + Vite          |
| Backend     | Java Spring Boot         |
| Database    | MySQL                    |
| ORM         | Spring Data JPA / Hibernate |
| Security    | Spring Security + JWT    |
| Build       | Maven (backend) / npm (frontend) |

## Project Structure

```
internlite/
  backend/           # Spring Boot application
    src/main/java/com/internlite/
      entity/       # 15 JPA entities
      repository/    # 15 JPA repositories
      service/       # Business logic (Student, Company, Internship, Application, Interview, Notification, Recruiter)
      controller/    # REST controllers (Auth, Student, Company, Internship, Application, Interview, Notification, Recruiter, Skill)
      config/        # JWT utils, security config, request filter
      dto/           # Request/response DTOs
      enums/         # Role, WorkType, InternshipStatus, ApplicationStatus, InterviewType, InterviewStatus, NotificationType
    src/main/resources/application.properties  # MySQL config

  frontend/          # React application
    src/
      api/           # Axios instance + API services
      components/    # Reusable components (Navbar, ProtectedRoute)
      context/       # Auth context (JWT auth state)
      pages/         # Route pages (Login, Register, Dashboard, Internships, Details, Profile, Applications)

  problem_statement.md   # Project specification
  ER Diagram.png         # Entity relationship diagram
  Architecture.png       # System architecture diagram
  Class diagrams.png     # UML class diagrams
  DataBase_Schema.sql/   # Database design docs + schema.sql
```

## Backend Setup

1. Create MySQL database: `CREATE DATABASE internlite;`
2. Update credentials in `backend/src/main/resources/application.properties`
3. Run backend:
   ```
   cd backend
   mvn spring-boot:run
   ```
   Server starts on http://localhost:8080

## Frontend Setup

1. Run frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   App starts on http://localhost:5173

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT)

### Internships
- `GET /api/internships` - Search/filter internships
- `GET /api/internships/{id}` - Get internship details

### Student Profile
- `GET /api/students/profile` - Get profile
- `PUT /api/students/profile` - Update profile

### Skills
- `GET /api/skills` - List all skills
- `GET /api/skills/student` - Get student skills
- `POST /api/skills/student/{skillId}` - Add skill
- `DELETE /api/skills/student/{skillId}` - Remove skill

### Applications
- `POST /api/applications` - Apply for internship
- `GET /api/applications/my` - Student's applications
- `PUT /api/applications/{id}/status` - Update status

### Interviews
- `POST /api/interviews/{appId}` - Schedule interview
- `GET /api/interviews/application/{appId}` - Get interview

### Recruiter
- `GET /api/recruiter/internships` - Recruiter's posted internships
- `GET /api/recruiter/internships/{id}/applications` - Applications for an internship
