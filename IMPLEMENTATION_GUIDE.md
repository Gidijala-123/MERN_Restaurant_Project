# GBR Grocery - Implementation Guide

## ✅ Project Features & Implementations

### 1. **Rate Limiting** ✅
- **Location**: `Back-end/server.js`
- **Implementation**: Three-tier rate limiter using `express-rate-limit`:
  - General API: 100 requests per 15 minutes
  - Login endpoint: 10 requests per 15 minutes
  - OTP endpoint: 5 requests per 15 minutes

### 2. **Refresh Token Authentication** ✅
- **Location**: `Back-end/controllers/authController.js`
- **Implementation**:
  - Access tokens: 15-minute expiry
  - Refresh tokens: 7-day expiry (stored in httpOnly cookies)
  - `/api/auth/refresh` endpoint reissues new access tokens
  - Automatic token rotation on successful refresh

### 3. **Debouncing** ✅
- **Location**: `Front-end/src/hooks/useDebounce.js`
- **Implementation**:
  - Custom React hook with 400ms delay
  - Used in SearchBar component to prevent excessive API calls
  - Optimizes search performance and reduces server load

### 4. **Memoization** ✅ **[NEW - IMPLEMENTED]**
- **Location**: 
  - `Front-end/src/components/home/Bodycontent/SEARCH_COMPONENT/SearchBar.jsx`
- **Implementation**:
  - `React.memo()` wraps SearchBar component
  - `useMemo()` memoizes products list and handlers
  - `useCallback()` prevents unnecessary child re-renders
  - Optimizes performance for frequently re-rendered components

### 5. **Helmet.js** ✅
- **Location**: `Back-end/server.js` (line 74)
- **Features**:
  - HSTS (HTTP Strict Transport Security) enabled in production
  - Cross-Origin Resource Policy set to "cross-origin"
  - X-Powered-By header disabled
  - Protects against common vulnerabilities

### 6. **OAuth 2.0 Integration** ✅
- **Location**: 
  - `Back-end/config/passport.js`
  - `Back-end/controllers/oauthController.js`
- **Providers**:
  - Google OAuth 2.0 (scope: profile, email)
  - GitHub OAuth 2.0 (scope: user:email)
- **Features**:
  - Automatic user creation on first login
  - JWT token generation on OAuth callback
  - Email-based user identification

### 7. **Express Error Handling** ✅
- **Location**: `Back-end/middleware/errorHandling.js`
- **Error Types Handled**:
  - VALIDATION_ERROR (400)
  - UNAUTHORIZED (401)
  - FORBIDDEN (403)
  - NOT_FOUND (404)
  - SERVER_ERROR (500)
- **Features**:
  - Stack traces hidden in production
  - Consistent error response format
  - Automatic error logging

### 8. **Role-Based Access Control (RBAC)** ✅
- **Location**: `Back-end/middleware/auth.js`
- **Implementation**:
  - `requireRole(...roles)` middleware function
  - Admin-only endpoints protected (e.g., `/api/admin/metrics`)
  - Roles stored in JWT tokens
  - Returns 403 Forbidden for unauthorized access

### 9. **Kafka Message Queue** ✅ **[NEW - FULLY INTEGRATED]**
- **Location**: `Back-end/services/kafka.js`
- **Features**:
  - Producer: Sends order events to Kafka
  - Consumer: Listens for order events (background process)
  - Auto-reconnection logic
  - Order event processing pipeline
- **Setup Required**:
  ```bash
  # Install Kafka locally or use Docker
  docker run -d --name kafka \
    -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
    confluentinc/cp-kafka:latest
  ```

### 10. **Load Balancing** ✅
- **Location**: `Back-end/cluster.js`
- **Implementation**:
  - Node.js cluster module for multi-core utilization
  - Worker processes spawned equal to CPU count
  - Automatic restart on worker failure
  - Improved throughput and fault tolerance

### 11. **OTP Functionality** ✅
- **Location**: 
  - `Back-end/services/otpService.js`
  - `Back-end/services/otpStore.js`
- **Features**:
  - 6-digit OTP generation
  - 5-minute TTL with auto-expiry
  - In-memory storage (for production, use Redis)
  - Endpoints:
    - `POST /api/otp/send` - Generate and send OTP
    - `POST /api/otp/verify` - Verify OTP code

### 12. **SMS OTP Integration** ✅ **[NEW - TWILIO INTEGRATED]**
- **Location**: `Back-end/services/otpService.js`
- **Providers Supported**:
  - **Twilio** (primary - paid but reliable)
  - **Mock** (default for development)
  - **Firebase** (fallback option)

#### **Setup Instructions for Twilio:**

1. **Sign up for Twilio**:
   - Go to [twilio.com](https://www.twilio.com)
   - Create a free trial account (gets $15 credit)
   - Verify your phone number

2. **Get Twilio Credentials**:
   - Account SID: Find in Account Dashboard
   - Auth Token: Find in Account Dashboard
   - Twilio Phone Number: Get a free trial number

3. **Configure Environment Variables** in `Backend/.env`:
   ```env
   OTP_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
   TWILIO_WHATSAPP_FROM=whatsapp:+1xxxxxxxxxx
   ```

4. **Install Twilio SDK**:
   ```bash
   cd Back-end
   npm install twilio
   ```

5. **Test OTP Flow**:
   - Use signup/login form to trigger OTP
   - SMS will be sent via Twilio
   - Verify with sent code

#### **Free Alternatives to Twilio**:
- **Firebase Authentication** (includes SMS)
- **AWS SNS** (AWS free tier eligible)
- **MSG91** (Indian provider, free tier available)

### 13. **Mobile Responsiveness** ✅
- **Breakpoints Implemented**:
  - **576px** (Extra small devices)
  - **768px** (Tablets)
  - **992px** (Large tablets/small desktops)
  - **1200px** (Desktops)
- **Responsive Components**:
  - SignUp/Login forms
  - Product listing (grid → single column)
  - Navigation (hamburger menu on mobile)
  - SearchBar (full width on mobile)
  - CartComponent (optimized layout)
  - BannerCarousel (adaptive height)

---

## 🚀 Quick Start Guide

### Backend Setup:
```bash
cd Back-end
npm install
# Add Twilio setup if SMS OTP is needed
npm install twilio

# Create .env file with required variables
cp .env.example .env

# Start server
npm start
# Or with clustering
node cluster.js
```

### Frontend Setup:
```bash
cd Front-end
npm install
npm run dev
```

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│         React Frontend (SPA)                 │
│  - Responsive Design (Mobile-First)          │
│  - Memoization & Debouncing Optimized       │
│  - Redux State Management                    │
└──────────────────────────┬────────────────────┘
                           │
                      HTTP/HTTPS
                           ↓
┌─────────────────────────────────────────────┐
│    Express Backend (Node.js)                 │
│  - Rate Limiting (3-tier)                    │
│  - Helmet.js Security                        │
│  - Error Handling Middleware                 │
│  - RBAC with JWT Auth                        │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┴────────┐
          ↓                 ↓
    ┌──────────┐      ┌──────────┐
    │ MongoDB  │      │  Kafka   │
    │ Database │      │  Queue   │
    └──────────┘      └──────────┘
          │                │
          └────────┬───────┘
                   ↓
      ┌──────────────────────┐
      │  OAuth Providers     │
      │  (Google, GitHub)    │
      │  Twilio SMS          │
      │  Admin Metrics       │
      └──────────────────────┘
```

---

## 🔧 Configuration Details

### Rate Limiting Tiers:
```javascript
// General endpoint
rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests
})

// Login endpoint  
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
})

// OTP endpoint
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
})
```

### Token Expiry:
```javascript
// Access Token: 15 minutes
// Refresh Token: 7 days
// OTP Code: 5 minutes
```

---

## 🔐 Security Features

1. ✅ HTTPS-only cookies (httpOnly flag)
2. ✅ CSRF protection via middleware
3. ✅ HSTS headers (production)
4. ✅ Rate limiting on sensitive endpoints
5. ✅ Email verification with OTP
6. ✅ JWT-based authentication
7. ✅ Role-based access control
8. ✅ Request ID tracking for logging
9. ✅ Input validation with Zod schemas

---

## 📱 Testing Credentials

### Test User:
```
Email: test@example.com
Password: Password@123
```

### Test Admin (if applicable):
```
Email: admin@example.com
Password: AdminPass@123
Role: admin
```

---

## 🐛 Troubleshooting

### SMS OTP Not Sending?
1. Check `OTP_PROVIDER` env variable
2. Verify Twilio credentials
3. Ensure phone number format: +1XXXXXXXXXX
4. Check Twilio free trial balance

### Kafka Connection Error?
1. Ensure Kafka broker is running on localhost:9092
2. Check `KAFKA_BROKERS` environment variable
3. View logs: `docker logs <kafka_container>`

### OAuth Not Working?
1. Verify Client ID/Secret in Google/GitHub dev console
2. Check callback URL matches configuration
3. Ensure redirect URLs are whitelisted

---

## 📚 Additional Resources

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [KafkaJS Documentation](https://kafka.js.org/)
- [Helmet.js Security Middleware](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/nfriedly/express-rate-limit)
- [Passport.js OAuth 2.0](http://www.passportjs.org/docs/oauth/)

---

*Last Updated: March 12, 2026*
