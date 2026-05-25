IClinic
IClinic is a full-stack clinic management web application built with Spring Boot, Angular, and SQL Server. It helps clinic staff manage patients, appointments, waiting room activity, visit history, medications, and staff authentication from a single web interface.

GitHub Description
Full-stack clinic management system with Spring Boot REST APIs, Angular UI, SQL Server persistence, bearer-token authentication, appointment scheduling, patient records, visit history, prescriptions, and an optional Ollama-powered clinic assistant.

Features
Staff registration and login with protected API routes
Bearer-token authentication using Spring Security
Patient registration, lookup, and detail management
Appointment creation, update, deletion, and date-based scheduling
Waiting room view for active appointments by date
Patient visit history tracking
Medication and prescription-related record management
Angular route guards for authenticated and guest-only pages
Optional AI clinic assistant powered by Ollama
Tech Stack
Backend
Java 17
Spring Boot
Spring Web
Spring Security
Spring Data JPA
Microsoft SQL Server
Maven
Frontend
Angular 19
TypeScript
Angular Material
RxJS
SCSS
Optional AI Integration
Ollama
Configurable local model, defaulting to llama3.1
Project Structure
IClinic/
+-- IClinic-backend/      # Spring Boot REST API
+-- IClinic-frontend/     # Angular client application
`-- README.md
Backend Configuration
The backend reads database credentials from environment variables.

spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=IClinic;encrypt=true;trustServerCertificate=true
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
Required environment variables:

DB_USERNAME=your_sql_server_username
DB_PASSWORD=your_sql_server_password
Optional Ollama environment variables:

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
Running the Application
1. Start SQL Server
Create a SQL Server database named IClinic. The backend uses Spring Data JPA with spring.jpa.hibernate.ddl-auto=update, so tables are created or updated automatically when the application starts.

2. Run the Backend
cd IClinic-backend
./mvnw spring-boot:run
On Windows PowerShell:

cd IClinic-backend
.\mvnw.cmd spring-boot:run
The backend runs at:

http://localhost:8080
3. Run the Frontend
cd IClinic-frontend
npm install
npm start
The frontend runs at:

http://localhost:4200
The Angular development server proxies /api requests to the Spring Boot backend at http://localhost:8080.

API Overview
Main backend routes include:

POST /api/staff/login - staff login
GET /api/staff - list staff
POST /api/staff - create staff account
GET /api/patients - list patients
GET /api/patients/{id} - get patient by ID
GET /api/patients/by-code - find patient by patient code
POST /api/patients - create patient
GET /api/appointments - list appointments
GET /api/appointments/by-date - list appointments for a date
GET /api/appointments/waiting-room - list active waiting room appointments
GET /api/visit-history/by-patient - get visit history by patient
POST /api/assistant/chat - chat with the optional AI clinic assistant
Most /api/** endpoints require authentication, except staff login and initial staff creation.

Frontend Pages
Login
Staff registration
Waiting room
Schedule
Patient search
Patient registration
Patient detail
Notes
This project is intended as a portfolio-level clinic management system.
The AI assistant provides educational clinic support only and is not intended for medical diagnosis.
Ollama is optional; the rest of the application can run without using the assistant feature.
