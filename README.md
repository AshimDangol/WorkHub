# WorkForceHub

Employee & Performance Management System — full-stack application with a JWT-secured REST API and a vanilla JS frontend.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: Socket.io
- **Other**: Nodemailer, Cloudinary, PDFMake, express-rate-limit

## Project Structure

```
WorkHub/
├── server.js               # Entry point
├── seed.js                 # Database seeder
├── package.json
├── .env
├── config/
│   ├── db.js
│   ├── email.js
│   ├── cloudinary.js
│   └── socket.js
├── middleware/
│   └── auth.js             # JWT authenticate + authorize
├── models/
│   ├── User.js
│   ├── Employee.js
│   ├── Attendance.js
│   ├── Department.js
│   ├── Leave.js
│   ├── Performance.js
│   ├── Training.js
│   └── Document.js
├── controllers/            # Business logic (15 controllers)
├── routes/                 # Express routers (15 route files)
└── frontend/
    ├── index.html
    ├── app.js
    ├── auth.js
    └── styles.css
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env` and fill in your values:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/workforcehub
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
ALLOWED_ORIGIN=http://localhost:3000

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

3. Seed the database:

```bash
npm run seed
```

4. Start the server:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

The app is available at `http://localhost:3000`.

## Default Credentials

| Role     | Username   | Password      |
|----------|------------|---------------|
| Admin    | admin      | admin123      |
| Manager  | manager    | manager123    |
| Employee | john.doe   | employee123   |

> Change these immediately in production.

## Authentication

All API endpoints (except `POST /api/auth/login`) require a Bearer token:

```
Authorization: Bearer <token>
```

Tokens are returned on login and expire after 7 days (configurable via `JWT_EXPIRES_IN`).

## API Endpoints

All responses follow `{ success, data?, message?, count?, total?, page?, pages? }`.

Pagination is supported on all list endpoints via `?page=1&limit=20`.

### Auth

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth` | Admin |
| GET | `/api/auth` | Admin |
| GET | `/api/auth/:id` | Authenticated |

### Employees

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/employees?page=&limit=&q=` | All |
| GET | `/api/employees/:id` | All |
| POST | `/api/employees` | Admin, Manager |
| PUT | `/api/employees/:id` | Admin, Manager |
| DELETE | `/api/employees/:id` | Admin, Manager |

> Deleting an employee cascades to all related attendance, leave, performance, training, and document records.

### Departments

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/departments` | All |
| GET | `/api/departments/:id` | All |
| POST | `/api/departments` | Admin |
| PUT | `/api/departments/:id` | Admin, Manager |
| DELETE | `/api/departments/:id` | Admin |

### Attendance

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/attendance?page=&limit=` | All |
| GET | `/api/attendance/:id` | All |
| POST | `/api/attendance` | Admin, Manager |
| PUT | `/api/attendance/:id` | Admin, Manager |
| DELETE | `/api/attendance/:id` | Admin, Manager |

### Leaves

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/leaves` | Own (employees), All (admin) |
| GET | `/api/leaves/:id` | Own or Admin |
| POST | `/api/leaves` | Authenticated |
| PUT | `/api/leaves/:id` | Admin (status), Owner (reason) |
| DELETE | `/api/leaves/:id` | Owner or Admin |

### Performance Reviews

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/performances` | All |
| GET | `/api/performances/:id` | All |
| POST | `/api/performances` | Admin, Manager |
| PUT | `/api/performances/:id` | Admin, Manager |
| DELETE | `/api/performances/:id` | Admin, Manager |

### Trainings

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/trainings` | All |
| GET | `/api/trainings/:id` | All |
| POST | `/api/trainings` | Authenticated |
| PUT | `/api/trainings/:id` | Authenticated |
| DELETE | `/api/trainings/:id` | Authenticated |

### Documents

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/documents` | Authenticated |
| GET | `/api/documents/:id` | Authenticated |
| POST | `/api/documents` | Authenticated |
| DELETE | `/api/documents/:id` | Owner or Admin |

### Dashboard

| Method | Path | Access |
|--------|------|--------|
| GET | `/api/dashboard/stats` | Authenticated |

### Search

| Method | Path |
|--------|------|
| GET | `/api/search/employees?q=&department=&position=` |
| GET | `/api/search/attendance?employeeId=&date=&status=&startDate=&endDate=` |
| GET | `/api/search/performances?employeeId=&minRating=&maxRating=&startDate=&endDate=` |

### Reports (Admin, Manager)

| Method | Path |
|--------|------|
| GET | `/api/reports/attendance/monthly?year=&month=` |
| GET | `/api/reports/performance?department=&minRating=` |
| GET | `/api/reports/department-utilization` |

### Analytics (Admin, Manager)

| Method | Path |
|--------|------|
| GET | `/api/analytics/retention` |
| GET | `/api/analytics/performance-distribution` |
| GET | `/api/analytics/department-performance` |
| GET | `/api/analytics/attendance-trends` |

### Payroll (Admin, Manager)

| Method | Path |
|--------|------|
| POST | `/api/payroll/generate` — body: `{ employeeId, month, year }` |

### Notifications (Admin, Manager)

| Method | Path |
|--------|------|
| POST | `/api/notifications/welcome` |
| POST | `/api/notifications/attendance-alert` |
| POST | `/api/notifications/performance` |

## Features

- JWT authentication with configurable expiry
- Role-based access control (admin / manager / employee)
- Rate limiting — 20 req/15min on login, 300 req/15min on all other routes
- Pagination on all list endpoints
- Cascade delete on employees
- Database indexes on frequently queried fields
- Dark/light theme toggle
- Real-time updates via Socket.io
- PDF payslip generation
- Email notifications via Nodemailer
- File uploads via Cloudinary
