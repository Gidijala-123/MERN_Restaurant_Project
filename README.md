# GBR Grocery Store Project

This repository is a full-stack MERN (MongoDB, Express, React, Node) web application that showcases a grocery store platform with robust authentication, real-time features, and responsive design.

## 🚀 Getting Started

### Prerequisites

- Node.js (>=14)
- npm or yarn
- MongoDB instance (local or hosted)
- Optional: Docker for Kafka

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/youruser/MERN_Restaurant_Project.git
   cd MERN_Restaurant_Project
   ```

2. Install backend dependencies:

   ```bash
   cd Back-end
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../Front-end
   npm install
   ```

4. Create environment files (`.env`) for backend and frontend as per `IMPLEMENTATION_GUIDE.md`.

5. Start backend server:

   ```bash
   cd ../Back-end
   npm start
   # or run `node cluster.js` to enable clustering
   ```

6. Start frontend dev server:
   ```bash
   cd ../Front-end
   npm run dev
   ```

## 🛠 Major Concepts Implementation

This section provides step-by-step implementation details for each major technical concept used in this project. Refer to `IMPLEMENTATION_GUIDE.md` for deeper explanation and environment configuration.

### 1. Rate Limiter

- Dependency: `express-rate-limit` (installed in backend).
- Configured in `Back-end/server.js` with 3 limiters: general, login, OTP.
- Usage example:
  ```js
  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
  app.post("/api/auth/login", loginLimiter, login);
  ```

### 2. Refresh Token Authentication

- Tokens issued in `authController.js` (`signAccess`, `signRefresh`).
- Refresh endpoint: `/api/auth/refresh`.
- Client refresh flow handled in `PrivateRoute.jsx`.

### 3. Debouncing

- Hook located at `Front-end/src/hooks/useDebounce.js`.
- Example usage in `SearchBar.jsx`.

### 4. Memoization

- Applied in `SearchBar.jsx` using `React.memo`, `useMemo`, `useCallback`.
- Prevents unnecessary re-renders.

### 5. Helmet.js for Security

- Initialized in `Back-end/server.js` with HSTS and security headers.
- Add helmet to dependencies: `npm install helmet`.

### 6. OAuth (Google & GitHub)

- Passport strategies in `Back-end/config/passport.js`.
- Routes defined in `server.js`.
- Callback handlers return JWT tokens.

### 7. Express Error Handling

- Middleware in `Back-end/middleware/errorHandling.js`.
- Added after routes in `server.js`.

### 8. Role-Based Access Control

- Middleware function `requireRole` in `Back-end/middleware/auth.js`.
- Protect admin route by wrapping in the middleware.

### 9. Kafka Integration

- Kafka client in `Back-end/services/kafka.js`.
- Initialize and subscribe during server startup.
- Send events using `sendOrderEvent`.

### 10. Load Balancing

- Setup using Node.js `cluster` in `Back-end/cluster.js`.
- Automatically forks workers equal to CPU count.

### 11. OTP Functionality

- OTP store and service in `Back-end/services/otpStore.js` and `otpService.js`.
- Supports SMS, WhatsApp, and **Email** channels.
- Endpoints `/api/otp/send` and `/api/otp/verify` in `server.js`.

### 12. SMS OTP via Free API (Twilio)

- Twilio integration in `otpService.js` with environment variables.
- Setup instructions in `IMPLEMENTATION_GUIDE.md`.
- For email OTP, configure Nodemailer SMTP variables as documented in the implementation guide.

### 13. Mobile Responsiveness

- CSS media queries implemented across front-end styles.
- See `Front-end/src/components/*/*.css` for breakpoints.

## 📁 Project Structure Overview

```
MERN_Restaurant_Project/
├─ Back-end/         # Node.js/Express API
│  ├─ controllers/   # API logic
│  ├─ middleware/    # Authentication, error handling
│  ├─ services/      # Kafka, OTP logic
│  ├─ models/        # Mongoose schemas
│  ├─ config/        # Passport/OAuth config
│  ├─ server.js      # Main entry point
│  ├─ cluster.js     # Optional load balancing
├─ Front-end/        # React/Vite application
│  ├─ src/
│  │  ├─ components/ # Reusable components
│  │  ├─ hooks/      # Custom hooks
│  │  ├─ features/   # Redux slices/apis
│  │  ├─ contexts/   # Theme and other contexts
│  │  ├─ validations/ # Zod schemas
│  │  └─ App.jsx
└─ README.md         # This file
```

## 🎯 Additional Notes

- The application uses Zod for schema validation on both front-end and back-end.
- CSRF protection is in place for state‑changing requests.
- Cookies are configured to be secure and httpOnly.
- Two environment groups (`backend` and `frontend`) exist for Render deployment.

For a developer new to the project, review `IMPLEMENTATION_GUIDE.md` after reading this README to get environment specifics and command references. Happy coding! 🎉
