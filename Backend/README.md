# ResumeIQ

ResumeIQ is a full-stack AI interview preparation platform. Users can register, log in, upload a resume PDF, add a job description and self description, and generate a personalized interview report with technical questions, behavioral questions, skill-gap analysis, and a preparation roadmap. The app also generates an ATS-friendly resume PDF tailored to the selected interview report.

This repository contains two applications:

- `Backend/` - Express API, MongoDB models, JWT cookie auth, AI report generation, and PDF export.
- `Frontend/` - React + Vite single-page app for authentication, interview generation, report viewing, and resume download.

## Features

- User registration, login, logout, and session restoration.
- Cookie-based JWT authentication with token blacklist support.
- Resume upload through multipart form-data.
- AI-generated interview report based on resume, job description, and self description.
- Match score, technical questions, behavioral questions, skill gaps, and a preparation plan.
- Interview report history for the signed-in user.
- Resume PDF generation from an existing interview report.
- Protected routes on the frontend.
- Responsive auth screens and report dashboards.

## Tech Stack

### Backend

- Express 5
- MongoDB with Mongoose 9
- JWT authentication with jsonwebtoken
- bcryptjs for password hashing
- cookie-parser for cookie access
- cors for cross-origin requests
- multer for in-memory PDF uploads
- pdf-parse for extracting text from resume PDFs
- @google/genai for interview and resume generation
- zod and zod-to-json-schema for response validation
- puppeteer for PDF rendering
- dotenv for environment variables

### Frontend

- React 19
- React Router DOM 7
- Axios for API requests
- Sass for styling
- Vite for development and builds

## Project Structure

```text
Backend/
	server.js
	src/
		app.js
		config/database.js
		controllers/
		middleware/
		models/
		routes/
		services/
Frontend/
	src/
		App.jsx
		app.routes.jsx
		main.jsx
		features/
			auth/
			interview/
```

## Backend Overview

`Backend/server.js` loads environment variables, connects to MongoDB, and starts the Express server.

`Backend/src/app.js` configures the Express app with:

- JSON body parsing
- cookie parsing
- CORS for `http://localhost:5173`
- route mounting for auth and interview APIs

### Environment Variables

Create a `.env` file inside `Backend/` with at least the following values:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
GOOGLE_GENAI_MODEL=gemini-3-flash-preview
```

## Backend Modules

### Database

`src/config/database.js` connects to MongoDB with `mongoose.connect(process.env.MONGO_URI)`.

### Models

- `User` stores `username`, `email`, and hashed `password`.
- `BlacklistToken` stores invalidated JWT tokens after logout.
- `InterviewReport` stores the generated interview output and the source input data.

The interview report schema contains:

- `jobDescription`
- `resume`
- `selfDescription`
- `matchScore`
- `technicalQuestions[]`
- `behavioralQuestions[]`
- `skillGaps[]`
- `preparationPlan[]`
- `user`

### Middleware

- `auth.middleware.js` reads the token from cookies, rejects blacklisted tokens, verifies JWTs, and attaches the decoded user to `req.user`.
- `file.middleware.js` configures multer with in-memory storage and a 5 MB file size limit.

### Controllers

#### Auth controller

- `registerUserController` validates input, checks for duplicate email, hashes the password, creates the user, signs a JWT, and sets a cookie.
- `loginUserController` checks credentials, signs a JWT, and sets a cookie.
- `logoutUserController` stores the current token in the blacklist and clears the cookie.
- `getMeController` returns the currently authenticated user without the password field.

#### Interview controller

- `generateInterviewReportController` accepts a resume PDF plus job and self descriptions, extracts resume text, generates the report with AI, stores it, and returns the saved document.
- `getInterviewReportByIdController` fetches a report that belongs to the current user.
- `getAllInterviewReportsController` returns all reports for the current user, sorted newest first.
- `generateResumePdfController` loads an interview report and generates a downloadable PDF resume from it.

### Services

`src/services/ai.service.js` contains the AI integration and PDF generation flow.

It provides:

- `generateInterviewReport()` - asks the model for structured interview data and normalizes the response before validation.
- `generateResumePdf()` - asks the model for a clean resume HTML payload, then renders it to PDF with Puppeteer.

Important implementation details:

- Interview generation validates response shape with Zod and normalizes mixed AI output before saving.
- Skill gaps use `severity` values of `low`, `medium`, or `high`.
- Resume PDF generation renders a compact A4 layout with print-specific styles.

## Backend API

### Auth Routes

Base path: `/api/auth`

- `POST /register` - register a new user.
- `POST /login` - log in an existing user.
- `GET /logout` - invalidate the current token and clear the auth cookie.
- `GET /get-me` - return the current user.

### Interview Routes

Base path: `/api/interview`

- `POST /` - generate a new interview report.
	- Requires auth.
	- Expects multipart form-data.
	- Resume file field name: `resume`
	- Also expects `jobDescription` and `selfDescription`.
- `GET /` - return all interview reports for the current user.
- `GET /report/:interviewId` - return one report by ID.
- `GET /resume/pdf/:interviewId` - generate and download a PDF resume for the selected report.

## Frontend Overview

`Frontend/src/main.jsx` mounts the React app.

`Frontend/src/App.jsx` wraps the app with:

- `AuthProvider`
- `InterviewProvider`
- `RouterProvider`

`Frontend/src/app.routes.jsx` defines the application routes.

### Frontend Routes

- `/register` - sign-up page.
- `/login` - login page.
- `/` - protected home page for creating interview reports.
- `/interview/:interviewId` - protected interview report page.

### Auth Feature

Files under `src/features/auth/` handle authentication state and forms.

- `auth.context.jsx` stores the current user and auth loading state.
- `hooks/useAuth.js` wraps the auth API and restores the logged-in user on mount.
- `services/auth.api.js` calls the backend auth endpoints.
- `components/protected.jsx` blocks unauthenticated access to protected routes.
- `pages/Login.jsx` renders the login screen.
- `pages/Register.jsx` renders the registration screen.

Auth flow behavior:

- Login and register forms send credentials to the backend through Axios.
- Auth state is restored by calling `GET /api/auth/get-me` when the app loads.
- Protected routes redirect unauthenticated users to `/login`.

### Interview Feature

Files under `src/features/interview/` handle report generation and display.

- `interview.context.jsx` stores interview loading state, the active report, and the report list.
- `hooks/useInteview.js` wraps the interview API and exposes helpers for report generation, fetching, and resume download.
- `services/interview.api.js` sends report and PDF requests to the backend.
- `pages/Home.jsx` is the interview creation dashboard.
- `pages/Interview.jsx` is the report detail and resume download page.

Home page behavior:

- Accepts job description, self description, and PDF resume upload.
- Shows readiness feedback based on filled inputs.
- Displays past interview reports.
- Calls the backend to generate a new report and navigates to the report detail page.

Interview page behavior:

- Loads a single report by ID.
- Shows match score, job snapshot, skill gaps, technical questions, behavioral questions, and preparation roadmap.
- Allows the user to download a resume PDF generated from that report.
- Uses tab-style navigation between the technical, behavioral, and roadmap sections.

### Frontend API Services

- `auth.api.js` points to `http://localhost:3000/api/auth` and uses `withCredentials: true`.
- `interview.api.js` points to `http://localhost:3000` and uses `withCredentials: true`.
- Resume generation downloads a binary blob response as a PDF file.

## Styling

The frontend uses Sass modules and shared styles for a polished UI:

- `src/style.scss` provides global base styles.
- `src/features/auth/auth.form.scss` styles the authentication screens.
- `src/features/interview/style/home.scss` styles the interview creation dashboard.
- `src/features/interview/style/interview.scss` styles the report details page.
- `src/style/button.scss` defines shared button styling.

## Notable Implementation Notes

- The frontend hook file for interviews is named `useInteview.js` in the repository, so imports must match that spelling unless the file is renamed everywhere.
- The interview upload endpoint expects the resume field to be named `resume`.
- The backend stores JWTs in cookies and checks the blacklist on protected routes.
- The AI layer normalizes model output before validation to avoid rejecting slightly inconsistent response shapes.
- Resume PDF generation is server-side and returns a downloadable PDF response.

## Local Development

### Backend

```bash
cd Backend
npm install
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default, and the backend runs on `http://localhost:3000` unless `PORT` is changed.

## Build And Preview

### Frontend production build

```bash
cd Frontend
npm run build
npm run preview
```

### Backend production start

```bash
cd Backend
npm start
```

## Summary

ResumeIQ combines authentication, resume parsing, AI-generated interview guidance, and PDF export into a single workflow. The backend owns identity, data storage, report generation, and document rendering, while the frontend provides the user experience for creating and reviewing interview preparation plans.
