# TalentAI 🚀

**AI-Powered Talent Management and Recruitment Platform**

TalentAI is a modern recruitment and talent management platform designed to simplify the hiring process and enhance job seekers' career journey. With **AI-driven ATS scoring**, **real-time communication**, **mock interviews**, and **network building features**, TalentAI empowers both **recruiters** and **job seekers** in one unified platform.

---

## 🌟 Features

### 🔐 Authentication & Security

* **JWT-based authentication** for secure login and signup.
* Role-based access for **Job Seekers** and **Recruiters**.

### 💼 Recruitment

* Recruiters can **add new job openings**.
* Job Seekers can **browse jobs** and **apply**.
* AI-powered **ATS (Applicant Tracking System) score** for resumes against job descriptions.

### 🤝 Networking

* Build professional connections (like LinkedIn).
* Send & accept connection requests.
* Group communication with **admin approval** to join groups.

### 💬 Real-Time Communication

* **One-to-one chat** with connections using **Socket.IO**.
* **Group chat** functionality.
* Share updates and interact in real-time.

### 🎯 Career Growth

* **Mock Interview Scheduling** with connections.
* **AI-powered chatbot** to answer career, job search, and interview-related questions.

### 📰 Additional Features

* Stay updated with the **latest news** in recruitment and technology.

---

## 🛠️ Tech Stack

### Frontend

* **React.js** ⚛️
* **Socket.IO Client** (real-time communication)

### Backend

* **Spring Boot** (REST APIs, JWT Auth, Job management)
* **Node.js + Socket.IO Server** (real-time chat, group communication, AI-based ATS scoring & chatbot logic)

### Database

* **MongoDB** (for resumes, messages, groups, socket sessions, ATS response cache)
* **MySQL** (for users, jobs, connections, mock interview details)

---

## ⚙️ Installation & Setup

### Prerequisites

* Node.js >= 16
* Java 17+ (for Spring Boot)
* MongoDB installed locally or cloud (Atlas).
* MYSQL installed locally.

### Clone Repository

```bash
git clone https://github.com/<your-username>/TalentAI.git
cd TalentAI
```

### Setup Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### Setup Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

### Setup AI Microservices and communication service

```bash
cd communication-service
npm install
nodemon server.js
```

---

## 📌 Roadmap

* [x] JWT Authentication
* [x] Add Job Openings
* [x] Resume ATS Score (AI-based)
* [x] Build Connections & Networking
* [x] Real-time Chat with Socket.IO
* [x] Group Communication with Admin Approval
* [X] Mock Interview Scheduling
* [X] AI Chatbot Enhancements
* [X] News Feed Integration

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature-xyz`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-xyz`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Yogendra Jhala**

* [LinkedIn](https://www.linkedin.com/in/yogendrajhala/)
* [GitHub](https://github.com/Yugg007)

---
