# DO-TODAY — Personal Task Manager

<div align="center">
  <img src="client/public/favicon.svg" alt="DO-TODAY Logo" width="80" height="80" />
  <h1>DO-TODAY</h1>
  <p><strong>A full-stack, high-performance personal task management application designed with precision, fluid drag-and-drop workflows, and robust security.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/React_Router-v7-CA4245?logo=react-router&logoColor=white" alt="React Router" />
    <img src="https://img.shields.io/badge/Node.js-LTS-339933?logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  </p>
</div>

---

## 📖 Overview

**DO-TODAY** is a personal task manager built from the ground up to achieve visual and functional fidelity with reference design specifications. It empowers users to organize daily responsibilities through multi-view dashboards, live statistics, interactive calendar scheduling, and cloud-backed file attachments.

---

## 📸 Reference Screens

| 1. Authentication (`/login`) | 2. Home Dashboard (`/`) |
|:---:|:---:|
| ![Login Page](docs/screenshots/01-login.png) | ![Home Page](docs/screenshots/03-home.png) |

| 3. Kanban Board (`/dashboard`) |
|:---:|
| ![Dashboard Kanban](docs/screenshots/02-dashboard-kanban.png) |

---

## ✨ Features

- **Multi-View Task Dashboard**:
  - **Kanban Board**: Drag-and-drop tasks across *Pending*, *In Progress*, and *Completed* columns powered by `@hello-pangea/dnd` with optimistic UI updates.
  - **List View**: Dense tabular listing with inline status toggles, priority badges, and due-date ordering.
  - **Timeline (Gantt-style) View**: Visual schedule overview spanning start dates to due dates with an active day indicator.
- **Home & Schedule Hub**:
  - Time-aware greeting (`Good Morning`, `Afternoon`, `Evening`) with vibrant text gradients.
  - Real-time user-scoped stat cards (*Active Tasks*, *Pending / In Progress*, *Completed*).
  - Segmented status tabs (*All*, *Pending*, *In Progress*, *Completed*).
  - Interactive calendar month view with task indicators and quick "Today" jump.
- **Secure Authentication & Recovery**:
  - JWT-based authentication stored with automated 401 interceptor logout.
  - Passwords hashed using `bcryptjs` (salt cost 12).
  - 3-step security question password recovery flow (`username lookup` → `security challenge` → `reset password`).
- **File Attachments**:
  - Support for images and PDFs up to 5 MB.
  - Automated Cloudinary cloud storage upload with seamless local disk fallback for offline development.
- **Data Export & Privacy**:
  - One-click JSON export generating a timestamped backup of the user profile and all personal tasks.
  - Self-service account deletion with confirmation safeguards.
- **Light / Dark Mode**:
  - Persistent theme toggle in the navigation bar, synchronized with database user preferences and system defaults.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **Core**: React 19, Vite 6
- **Styling**: Tailwind CSS v3, PostCSS, Custom Design Tokens
- **Routing**: React Router v7
- **Drag & Drop**: `@hello-pangea/dnd`
- **HTTP Client**: Axios with request/response interceptors
- **Icons**: Lucide React
- **Typography**: Google Fonts (*Outfit* for headings/numbers/logo, *Inter* for body/UI)

### Backend (`server/`)
- **Runtime & Framework**: Node.js (LTS), Express.js
- **Database**: MongoDB with Mongoose ODM (indexed user-scoped queries)
- **Security & Utilities**: `jsonwebtoken`, `bcryptjs`, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `express-validator`
- **File Uploads**: `multer` with memory storage and Cloudinary SDK
- **Logging**: `morgan` (development & combined production formats)

---

## 📂 Repository Structure

```text
DO-TODAY/
├── README.md                     # Project documentation
├── DO-TODAY_SPEC.md              # Detailed engineering specification
├── package.json                  # Root scripts
├── docs/
│   └── screenshots/              # Reference UI source images
│       ├── 01-login.png
│       ├── 02-dashboard-kanban.png
│       └── 03-home.png
├── client/                       # Frontend application (React 19 + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── api/axios.js          # Axios client with JWT & 401 interceptor
│   │   ├── context/              # AuthContext, ThemeContext, TaskContext
│   │   ├── components/
│   │   │   ├── layout/           # Navbar, ProtectedRoute, PageShell
│   │   │   └── tasks/            # TaskModal
│   │   ├── pages/                # Login, Signup, ForgotPassword, Home, Dashboard, etc.
│   │   ├── App.jsx               # App routes & provider nesting
│   │   ├── main.jsx              # React DOM root
│   │   └── index.css             # Tailwind layers, gradients, and CSS variables
│   └── .env.example
└── server/                       # Backend REST API (Node.js + Express)
    ├── server.js                 # HTTP listener & database connection
    ├── src/
    │   ├── app.js                # Express app setup, middleware & routes
    │   ├── config/db.js          # Mongoose connection
    │   ├── models/               # User.js, Task.js
    │   ├── controllers/          # auth, task, user controllers
    │   ├── routes/               # auth.routes, task.routes, user.routes
    │   ├── middleware/           # auth (protect), upload, validate, error
    │   └── utils/                # storage (Cloudinary / local fallback)
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or LTS recommended)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas cluster URI)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/your-username/DO-TODAY.git
cd DO-TODAY
```

### 2. Environment Configuration

#### Backend Configuration
Copy `.env.example` in `server/` to `.env`:
```bash
cp server/.env.example server/.env
```
Fill in the required values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/do-today
JWT_SECRET=your_super_secret_random_key_at_least_32_characters
JWT_EXPIRES_IN=7d
CLIENT_ORIGINS=http://localhost:5173

# Optional: Cloudinary for cloud attachments (falls back to local disk if omitted)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend Configuration
Copy `.env.example` in `client/` to `.env`:
```bash
cp client/.env.example client/.env
```
Ensure the API endpoint is set:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies
Install dependencies for both client and server:
```bash
# Root helper
npm install

# Backend
cd server && npm install && cd ..

# Frontend
cd client && npm install && cd ..
```

### 4. Run Development Servers
Start both backend and frontend concurrently:
```bash
# From repository root:
npm run dev
```

Or run each independently:
- **Server**: `cd server && npm run dev` (starts on `http://localhost:5000`)
- **Client**: `cd client && npm run dev` (starts on `http://localhost:5173`)

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <jwt_token>` header.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `POST` | `/api/auth/forgot/question` | Fetch security question by username | Public |
| `POST` | `/api/auth/forgot/verify` | Verify security answer & issue reset token | Public |
| `POST` | `/api/auth/forgot/reset` | Reset account password with token | Public |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/tasks` | List user tasks with optional query filters (`q`, `status`, `priority`, `from`, `to`, `date`) | Private |
| `GET` | `/api/tasks/stats` | Fetch aggregate stats (`active`, `pendingInProgress`, `completed`) | Private |
| `POST` | `/api/tasks` | Create task with optional multipart file uploads | Private |
| `GET` | `/api/tasks/:id` | Retrieve single task by ID | Private |
| `PUT` | `/api/tasks/:id` | Update task details and attachments | Private |
| `PATCH`| `/api/tasks/:id/status` | Update task status & Kanban column order | Private |
| `DELETE`| `/api/tasks/:id` | Delete task and associated files | Private |
| `DELETE`| `/api/tasks/:id/attachments/:attachmentId` | Remove specific task attachment | Private |

### Users (`/api/users`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `PATCH` | `/api/users/me` | Update display name and theme | Private |
| `PATCH` | `/api/users/me/password` | Change user password | Private |
| `GET` | `/api/users/me/export` | Download complete JSON account backup | Private |
| `DELETE` | `/api/users/me` | Delete account and all associated tasks | Private |

---

## 🚢 Deployment Guide

### Database (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write privileges.
3. In Network Access, allow inbound connections (or `0.0.0.0/0` for cloud deployment).
4. Copy the connection string to `MONGODB_URI`.

### Backend API (Render)
1. Create a new **Web Service** on [Render](https://render.com/) pointing to your repository.
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGINS=https://your-frontend.vercel.app`).
6. Health Check Path: `/api/health`.

### Frontend Client (Vercel)
1. Import repository on [Vercel](https://vercel.com/).
2. Root Directory: `client`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables: `VITE_API_URL=https://your-render-backend.onrender.com/api`.
7. SPA routing is managed by `client/vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

---

## 💡 What I Learned

1. **Strict Design Fidelity**: Recreating a UI from screenshots without deviations demands careful attention to micro-details: 1px border subtleties, custom gradients (`#E23E52` to `#B8283D`), geometric font weight balancing (Outfit vs. Inter), and exact typography spacing.
2. **Robust Multi-Layer Security**: Building a real-world auth flow involves far more than token issuance—it requires rate-limiting brute force attempts, normalizing and hashing security questions, safeguarding against NoSQL injections, and maintaining strict user-scoped database isolation.
3. **Decoupled State Architecture**: Structuring application state across distinct React Contexts (`AuthContext`, `ThemeContext`, and `TaskContext`) keeps concerns separated, simplifies optimistic UI updates during drag-and-drop operations, and eliminates prop drilling.
4. **Cloud-Ready Hybrid Storage**: Designing storage adapters that seamlessly switch between local disk storage during development and Cloudinary object storage in production prevents deployment failures on ephemeral platforms like Render.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

