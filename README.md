# 📚 StudySync – Collaborative Study Session Scheduler & Resource Share

StudySync is a full-stack web application designed to simplify group study coordination for students. It allows users to create study sessions, propose and vote on time slots, share study resources, and provide feedback — all in one platform.

---

## 🚀 Live Demo

🔗 [Deployed Link](https://study-sync-tau-coral.vercel.app/)

---

## 🧠 Problem Statement

Students working in groups often waste time coordinating suitable study times and exchanging resources across scattered platforms. **StudySync** addresses this by offering a centralized solution for:

- Scheduling collaborative study sessions.
- Sharing notes, PDFs, and links in a session-specific library.
- Voting on preferred time slots.
- Viewing sessions in a personal and integrated calendar.
- Rating and reviewing past sessions with feedback analytics.

---

## 🎯 Features

### ✅ Authentication

- Email/password login
- Secure session-based access
- Only participants can access specific session resources and voting panels

### 📅 Session Scheduling

- Hosts define topics and invite participants
- Participants propose suitable time slots
- Invitees vote on slots; majority wins
- Confirmation notices automatically sent

### 📁 Resource Sharing

- Upload/download notes, PDFs, and links with timestamps
- Session-specific resource folders

### 📆 Calendar Integration

- View upcoming sessions in a personal calendar
- Google Calendar integration (optional)

### 📊 Post-Session Feedback

- Rating & comment form
- Analytics dashboard showing:
  - Topic popularity
  - Session frequency & duration
  - Feedback trends

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Tailwind CSS
- Vite

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose

### Others

- Vercel and Render (Deployment)
- Google Calendar API (Integration)
- JWT (Authentication)

---

## 🗂️ Project Structure

```
studysync/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── package.json
└── vercel.json
```
