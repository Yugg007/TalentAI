# TalentAI

**TalentAI** is a full‑stack, multi‑service web application that helps users register/login, connect with other users, chat (private/group/video), schedule meetings via Google Calendar, analyze resumes against job descriptions (ATS scoring), post and browse jobs, and interact with an AI chatbot. The system is split into three services: a Spring Boot backend, a Node.js communication service, and a React/Vite frontend.

---

## 🧩 Architecture Overview

```
+----------------------+        +----------------------+        +-----------------------+
|    React Frontend    | <----> | Spring Boot Backend  | <----> | MySQL Database        |
| (port 9001 via Vite) |        | (port 9002 "/TalentAI") |      +-----------------------+
|                      |        |                      |        
|                      |        |                      |        
+---|------------------+        +----------------------+        +-----------------------+
      |                          |
      | Socket.io / REST         |
      v                          v  (External services)
+----------------------+        +----------------+
| Node Communication   | <----> | Google Calendar |
| Service (port 9004)  |        | / Cohere AI     |
+----------------------+        +----------------+
      ^
      |
      |
      v
+----------------+
|    MongoDB      |
| (chats & cache) |
+----------------+
```

Each service runs independently and can be containerised using the provided Dockerfiles.

---

## 🔧 Technology Stack

| Layer                | Technologies                                         |
|----------------------|-----------------------------------------------------|
| Backend API          | Java 21, Spring Boot 3.x, Hibernate/JPA, JWT        |
| Frontend             | React 18, Vite, JSX, CSS                            |
| Chat/AI Microservice | Node.js 18+, Express, Socket.io, MongoDB, Cohere AI |
| Database             | MySQL 8 (persistent data), MongoDB (chat/cache)     |
| Authentication       | JWT stored in AES‑encrypted cookies                 |
| OAuth                | Google Calendar (via OAuth2 flow)                   |
| Logging              | `System.out`/`console.log` (replace with SLF4J/Winston) |

---

## 📦 Prerequisites

Before you begin, ensure the following are installed on your development machine or server:

1. **Java 21** (or compatible JDK)
2. **Maven 3.6+**
3. **Node.js 18+ and npm**
4. **MySQL 8** server (or compatible)
5. **MongoDB 6+** server
6. **Git**

Optionally, install `docker` and `docker-compose` if you plan to run services in containers.

---

## 🌱 Environment Configuration

### 1. Remove sensitive data

- **Backend**: delete hard‑coded values in `backend/src/main/resources/application.properties` and replace with environment variable references.

  ```properties
  # application.properties (example)
  spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/talentai}
  spring.datasource.username=${DB_USER:root}
  spring.datasource.password=${DB_PASS:password}

  google.client.id=${GOOGLE_CLIENT_ID:}
  google.client.secret=${GOOGLE_CLIENT_SECRET:}
  google.redirect.uri=${GOOGLE_REDIRECT_URI:https://localhost:9002/TalentAI/api/google/oauth2callback}
  ```

- **Communication service**: keep secrets in an `.env` file **not committed to source control**. Add `.env` to `.gitignore`.

  ```ini
  # communication-service/.env
  COHERE_API_KEY=your_cohere_api_key_here
  MONGO_URI=mongodb://localhost:27017/talentai
  ```

  Ensure `server.js` or config logic reads `process.env.COHERE_API_KEY` and `process.env.MONGO_URI` (already done for Cohere).

### 2. Example environment file for local development

Create `backend/.env` (optional) with:

```ini
DB_URL=jdbc:mysql://localhost:3306/talentai
DB_USER=root
DB_PASS=<your sql db password>
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://localhost:9002/TalentAI/api/google/oauth2callback
```

Tools such as [dotenv‑spring‑boot](https://github.com/m-mozhaev/dotenv-spring-boot) or standard Spring capabilities can be used to load these variables.

### 3. Google OAuth and Cohere

- **Google credentials:** create an OAuth 2.0 client in Google Cloud Console. Set the redirect URI to `https://<your‑host>:9002/TalentAI/api/google/oauth2callback`.
- **Cohere API key:** register at Cohere, obtain an API key, and place it in `.env` or your production secret store.

### 4. Other configuration

- `Property.js` (frontend) contains `SpringBackendPath` and `NodeBackendPath` – change these to point at deployed URLs or use environment variables when building the frontend.

---

## 🚀 Running Locally (each service)

### 1. Start MySQL & MongoDB

```bash
# ensure MySQL running on default port and has a database named 'talentai'
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS talentai;"

# optionally start MongoDB:
# brew services start mongodb-community
```

### 2. Backend (Spring Boot)

```bash
cd backend
# load your env variables (e.g. export from ~/.bashrc or via .env loader)
./mvnw clean package
./mvnw spring-boot:run
```

The backend will listen on `https://localhost:9002/TalentAI` (SSL enabled). You can disable SSL for testing by removing the `server.ssl` properties.

### 3. Communication Service (Node)

```bash
cd ../communication-service
npm install              # or yarn
# create .env with COHERE_API_KEY and MONGO_URI
node server.js           # or nodemon server.js for hot reload
```

The service runs on `http://localhost:9004`.

### 4. Frontend (React)

```bash
cd ../frontend
npm install
npm run dev
```

Navigate to `http://localhost:9001` (or whichever port Vite chooses). The SPA communicates with backend endpoints and the chat service.

### 5. Chrome/Edge CORS & SSL

Because the Spring backend uses HTTPS with a self‑signed certificate, you may need to trust it in your browser or disable SSL verification during development. For cookies to work across domains, ensure `withCredentials: true` in axios and adjust CORS as needed.

---

## 🧠 Additional Usage

- **Register/Login:** use `/user/register` and `/user/login`; JWT is stored in AES‑encrypted cookie `talentAiToken` and includes optional `googleAccessToken` claim.
- **Google OAuth flow:** visit `GET /api/google/oauth2/authorize` from the frontend; callbacks post message to `http://localhost:9001`.
- **Chat:** React component `ChatRoom` connects to Node service via Socket.io; events include `sendPrivateMessage`, `sendGroupMessage`.
- **ATS Score:** upload resume PDF and job text from UI; Node service hashes inputs and queries Cohere; results cached in Mongo.
- **Jobs & Connections:** managed via Spring endpoints `/job`, `/user` etc.
- **Mock interviews, news section, chatbot, etc.** implemented in frontend components.

---

## 🗂 Deployment Suggestions

1. **Environment variables:** keep secrets out of source control. Use a vault or container orchestration environment (Docker secrets, Kubernetes ConfigMap).
2. **Dockerisation:** each directory contains a `Dockerfile`. Write a `docker-compose.yml` at root to orchestrate all three services plus MySQL/Mongo.
3. **SSL:** in production, use valid certificates and hostnames; adjust Spring and Node accordingly.
4. **Database migrations:** consider using Flyway or Liquibase. Currently JPA auto‑updates schema.
5. **Logging & monitoring:** replace `System.out`/`console.log` with proper logging frameworks.

---

## 📁 Code Structure Summary

- **backend/** – Spring Boot project with controllers, services, models, utils.
- **communication-service/** – Express server, socket handlers, AI helpers, Mongo schema.
- **frontend/** – React components, utils, CSS styles, Vite config.

Refer to earlier architecture section for relationships.

---

## 📘 Tips & Troubleshooting

- **Port conflicts:** adjust `server.port` or Vite dev server if necessary.
- **Cookie problems:** Cookies require HTTPS and correct `SameSite=None; Secure` settings; ensure front and back domains align.
- **CORS errors:** backend controllers already set `@CrossOrigin(origins = "*")` for job endpoints. Add more granular rules if needed.
- **Google OAuth failing:** verify redirect URI and client secrets, ensure the user consents to calendar and profile scopes.
- **Mongo connection:** use `MONGO_URI` env var; the service prints a connection message on start.
- **Cohere API errors:** check the key and network connectivity; log the full response in `Apis/Cohere.js`.

---

## ✅ After Reading
By following this document and populating the required environment variables, you should be able to:

1. Build and run each service locally on any machine with the prerequisites.
2. Understand how the frontend interacts with both backends.
3. Replace hard‑coded secrets with environment‑driven configuration.
4. Deploy the system on a different server or container platform with minimal friction.

Enjoy exploring and extending **TalentAI**!
