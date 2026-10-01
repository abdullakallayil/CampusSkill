# 🎓 CampusSkill — Student Freelance & Skill Exchange Platform

CampusSkill is a full-stack web platform designed to empower university students by connecting them with clients for freelance gigs, creative projects, and technical jobs. It features student portfolios, verified skills, interactive job boards, direct messaging, and an administrative control panel.

---

## 🌟 Key Features

- **💼 Marketplace for Campus Freelancers**:
  - Filter jobs by category, budget tier, and search keywords.
  - Direct application flow with cover letters and expected delivery times.

- **👨‍🎓 Student Profiles & Portfolios**:
  - Showcase technical & creative skills (Web Dev, UI/UX, Video Editing, Python, Graphic Design, etc.).
  - Upload portfolio items with project links, categories, and cover images.
  - Reviews & Star ratings from completed client projects.

- **🏢 Client Job Management**:
  - Post and manage freelance gigs with defined deadlines and budgets.
  - Review applicant submissions, view student profiles, and update application statuses (Accepted, Shortlisted, Rejected).

- **💬 Real-Time Messaging**:
  - Direct messaging between students and clients to discuss project details and deliverables.

- **🛡️ Admin Portal**:
  - Complete administrative oversight: user management, job moderation, category skills management, and platform analytics.

- **⚡ Zero-Config Offline Database Fallback**:
  - Built-in embedded persistent MongoDB fallback (`mongodb-memory-server`) with automatic database seeding. Runs immediately out-of-the-box even without an external MongoDB Atlas cluster!

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios, Modern Vanilla CSS |
| **Backend** | Node.js, Express 5, Mongoose (MongoDB ODM), Multer |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Database** | MongoDB Atlas with auto-fallback to persistent embedded MongoDB |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes bundled with Node.js)

### 2. Clone the Repository
```bash
git clone https://github.com/abdullakallayil/CampusSkill.git
cd CampusSkill
```

### 3. Install Dependencies
Run the install command from the root directory to install dependencies for both server and client:
```bash
npm run install-all
```
*(Or manually run `npm install` inside `/server` and `/client`)*

### 4. Environment Configuration (Optional)
The backend works out-of-the-box without extra setup. To customize configurations or connect your own MongoDB Atlas instance:
1. Copy `server/.env.example` to `server/.env`:
   ```bash
   cp server/.env.example server/.env
   ```
2. Adjust variables as needed:
   ```env
   PORT=5000
   JWT_SECRET=campusskill_super_secret_jwt_key_2024
   CLIENT_URL=http://localhost:5173
   # MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campusskill
   ```

### 5. Start the Application
Run both the backend API and frontend dev server with a single command from the project root:
```bash
npm start
```
*(or `npm run dev`)*

- **Frontend Application (Dev)**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🌐 Deploy Live Online for Free (Render.com)

CampusSkill is configured as a unified single-service application. Both the React frontend and Express backend are served together on a single public URL.

1. **Sign in to [Render.com](https://render.com)** (Free, sign in with GitHub).
2. Click **New +** > **Web Service**.
3. Select your repository: **`abdullakallayil/CampusSkill`**.
4. Configure the settings (or let Render auto-detect from `render.yaml`):
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. *(Optional for persistence)*: In **Environment Variables**, add:
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster1.3iyndhr.mongodb.net/campusskill`
   - `JWT_SECRET`: `campusskill_super_secret_jwt_key_2024`
6. Click **Deploy Web Service**!
7. Within 2-3 minutes, Render gives you a public URL (e.g. `https://campusskill.onrender.com`) that anyone in the world can open, with full frontend and working backend API!

---

## 🔑 Pre-Seeded Demo Accounts

The application automatically seeds the following ready-to-use demo accounts on first run:

| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@campusskill.com` | `admin123` | Full access to `/admin` management dashboard |
| **Student** | `student@demo.com` | `demo123` | Student dashboard, profile, portfolio & applications |
| **Client** | `client@demo.com` | `demo123` | Post gigs, hire students & review applicants |

*You can also create new student or client accounts anytime via the Registration page.*

---

## 📁 Repository Structure

```text
CampusSkill/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static assets & upload directory
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Cards)
│   │   ├── context/            # AuthContext & state management
│   │   ├── pages/              # Views (Home, Jobs, Profiles, Dashboards, Admin)
│   │   ├── api.js              # Axios instance with auth interceptor
│   │   └── index.css           # Design tokens, variables & responsive styling
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Node.js & Express API
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # Mongoose schemas (User, Job, Application, etc.)
│   ├── routes/                 # REST API endpoints (auth, users, jobs, messages)
│   ├── db.js                   # MongoDB connection & auto-seeding logic
│   ├── index.js                # Express app entry point
│   ├── seed.js                 # Database seeding script
│   └── package.json
├── .gitignore                  # Git ignore rules for node_modules, build & env
├── package.json                # Root orchestration scripts
└── README.md                   # Documentation
```

---

## 📡 REST API Reference

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/health` | GET | Public | Server health status |
| `/api/auth/register` | POST | Public | Register student or client |
| `/api/auth/login` | POST | Public | Authenticate user & receive JWT |
| `/api/auth/me` | GET | Authenticated | Get current user profile |
| `/api/jobs` | GET | Public | List open jobs (filters available) |
| `/api/jobs` | POST | Client / Admin | Post a new freelance gig |
| `/api/jobs/:id` | GET | Public | Get detailed job information |
| `/api/users/students` | GET | Public | List student freelancers & skills |
| `/api/users/:id` | GET | Public | Get student public profile & reviews |
| `/api/applications` | POST | Student | Submit proposal for a gig |
| `/api/messages` | GET / POST | Authenticated | Direct messaging between parties |
| `/api/admin/*` | GET / POST / PUT | Admin | Administrative platform management |

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).
