# 🍽️ GBR Grocery & Restaurant Platform

A high-performance, full-stack MERN application featuring a database-driven Indian menu system, robust authentication, real-time order processing with Kafka, and optimized performance.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (>=14)
- **MongoDB** (Local or Atlas)
- **Kafka** (Optional, for real-time order events)
- **Twilio/Gmail** (Optional, for OTP functionality)

### 2. Backend Setup
```bash
cd Back-end
npm install
# Populate the database with 69 Indian menu items
node migrate-menu-data.js
# Start with clustering for multi-core performance
node cluster.js
```

### 3. Frontend Setup
```bash
cd Front-end
npm install
npm run dev
```

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, RTK Query, Material UI, React Router v6.
- **Backend**: Node.js, Express.js, Mongoose ODM.
- **Database**: MongoDB (Indexed for fast category/search queries).
- **Messaging**: Apache Kafka for asynchronous order event processing.
- **Security**: JWT (Access/Refresh tokens), Helmet.js, CSRF protection, Rate Limiting.
- **Deployment**: Optimized for Render with clustering and production-ready security headers.

---

## ✅ Core Features & Implementation

### 1. Optimized Menu System
Moved from a frontend-hardcoded approach to a **Backend-API-driven architecture**.
- **Data**: 69 authentic Indian items across 9 main categories (Starters, Main Course, Biryani, etc.).
- **Performance**: 4-6x faster initial page load through server-side filtering and pagination.
- **Search**: Full-text indexed search in MongoDB.
- **Endpoints**:
  - `GET /api/menu/categories` - Fetch all 16 categories.
  - `GET /api/menu/search?q=<query>` - Fast indexed search.
  - `GET /api/menu/stats` - Real-time category analytics.

### 2. Advanced Authentication
- **Dual-Token System**: Short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d) in httpOnly cookies.
- **OAuth 2.0**: Integrated Google and GitHub login via Passport.js.
- **OTP Verification**: 6-digit codes via SMS (Twilio), WhatsApp, or Email (Resend API).

### 3. Performance & Reliability
- **Load Balancing**: Native Node.js `cluster` module forks workers based on CPU count.
- **Debouncing & Memoization**: Custom `useDebounce` hook and React `memo/useMemo` to optimize search and re-renders.
- **Message Queue**: Kafka integration for decoupled, background order processing.
- **Rate Limiting**: 3-tier protection (General API, Login, and OTP endpoints).

### 4. Security
- **Helmet.js**: HSTS, X-Frame-Options, and secure header management.
- **CSRF**: Double-submit cookie pattern for state-changing requests.
- **Validation**: Strict schema validation using **Zod** on both Frontend and Backend.

---

## 📁 Project Structure

```
MERN_Restaurant_Project/
├─ Back-end/         # Node.js/Express API
│  ├─ controllers/   # Business logic
│  ├─ middleware/    # Auth, RBAC, Error Handling
│  ├─ models/        # Mongoose schemas (User, Menu, etc.)
│  ├─ services/      # Kafka, OTP, Twilio integrations
│  ├─ routers/       # RESTful API routes
│  └─ cluster.js     # Multi-core load balancing
├─ Front-end/        # React/Vite application
│  ├─ src/
│  │  ├─ components/ # Reusable UI components
│  │  ├─ features/   # Redux Toolkit slices & RTK Query APIs
│  │  ├─ contexts/   # Theme & Menu state management
│  │  └─ hooks/      # useDebounce, etc.
└─ README.md         # Consolidated Documentation
```

---

## 🛠️ Environment Configuration (.env)

### Backend (`Back-end/.env`)
```env
PORT=1234
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
KAFKA_BROKERS=localhost:9092
OTP_PROVIDER=twilio # or smtp/gmail
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

### Frontend (`Front-end/.env`)
```env
REACT_APP_API_URL=http://localhost:1234/api
```

---

## 🔮 Future Roadmap (2026 Migration)
- **Type-Safety**: Migration of the entire codebase to TypeScript.
- **React 19**: Leveraging new features like Actions and simplified state handling.
- **Real-Time**: Integration of Socket.io for live order tracking.
- **Styling**: Transitioning to Tailwind CSS for utility-first responsive design.
- **Payments**: Modular Stripe integration for secure checkout.

---

*Last Updated: March 2026*
