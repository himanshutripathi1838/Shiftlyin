# Shiftlyin


Shiftlyin is a React + Vite + Firebase job portal for college students and local businesses. Students can discover part-time jobs, apply for shifts, check in with GPS, and build ratings. Restaurant owners and local businesses can post jobs, review applications, accept or reject students, track vacancies, and manage attendance.

Tagline: **Earn While You Learn**

## Tech Stack

- React.js + Vite
- JavaScript
- React Router
- Firebase Authentication
- Cloud Firestore
- Firebase Storage-ready setup
- Browser Geolocation API
- Responsive CSS

## Main Features

- Student registration and login
- Restaurant owner/business registration and login
- Role-based protected routes
- Student dashboard
- Restaurant owner dashboard
- Real-time Firestore job listings
- Job posting with urgency, location, salary, and vacancies
- Student job applications
- Application statuses: `pending`, `accepted`, `rejected`
- Vacancy auto-decrease when an application is accepted
- Job auto-closes as `filled` when vacancies reach zero
- GPS check-in/check-out within 100 meters of job location
- Student and business rating system
- Real-time notifications
- Responsive mobile UI

## Firebase Collections

The app uses these Firestore collections:

- `users`
- `jobs`
- `applications`
- `attendance`
- `notifications`
- `reviews`
- `chats`

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

## Firebase Setup

In Firebase Console:

1. Create a Firebase project.
2. Add a Web app and copy the Firebase config into `.env`.
3. Enable **Authentication > Email/Password**.
4. Create **Cloud Firestore Database**.
5. Enable **Firebase Storage** if file uploads are needed later.

## Cloudinary Setup

Shiftlyin uses Cloudinary for image uploads such as student profile photos, college ID photos, restaurant/shop photos, and license photos.

1. Create a Cloudinary account.
2. Open Cloudinary Dashboard and copy your **Cloud name**.
3. Go to **Settings > Upload > Upload presets**.
4. Create an upload preset with **Signing Mode: Unsigned**.
5. Add these values to `.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Do not put Cloudinary API secret in frontend code.

For development, Firestore test rules can be used temporarily. Use secure rules before production.

## Install

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Open:

```txt
http://127.0.0.1:5173
```

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## User Flow

1. Register as a Restaurant Owner.
2. Post a job with location, salary, vacancies, and urgency.
3. Register as a Student.
4. Student views active jobs and applies.
5. Owner accepts or rejects applications.
6. Accepted application decreases vacancy count.
7. Student uses GPS check-in/check-out for accepted jobs.
8. Ratings and notifications update in Firestore.

## Project Structure

```txt
src/
  components/
    admin/
  context/
  data/
  pages/
    admin/
    business/
    public/
    shared/
    student/
  services/
  styles/
  utils/
```

Important files:

- `src/services/firebase.js` - Firebase initialization
- `src/context/AuthContext.jsx` - Auth state and user profile
- `src/pages/public/Register.jsx` - Role-based registration
- `src/pages/public/Login.jsx` - Login and role redirect
- `src/pages/student/StudentDashboard.jsx` - Student job feed
- `src/pages/business/BusinessDashboard.jsx` - Restaurant owner dashboard
- `src/pages/business/PostJob.jsx` - Job posting
- `src/pages/shared/Applications.jsx` - Accept/reject applications
- `src/pages/shared/Attendance.jsx` - GPS check-in/check-out and ratings
- `src/pages/admin/` - Admin-only pages
- `src/components/admin/` - Admin-only layout, table, route protection, and sidebar

## Admin Access

Admin UI is isolated from normal student/business UI.

- Admin pages live in `src/pages/admin/`
- Admin components live in `src/components/admin/`
- Admin routes are protected by `AdminProtectedRoute`
- A user becomes admin only if Firestore contains `admins/{uid}`
- Normal student/business users do not see admin sidebar or admin links

## Notes

- The app uses real Firebase Authentication and Firestore queries.
- No mock data is required for the production flow.
- If the page is blank, restart the Vite server after changing config files.
- If login shows `auth/invalid-credential`, register the user first and verify the user exists in Firebase Authentication.




npm.cmd run dev



/// Requrement Project



Build a full React + Vite + Firebase web app named Shiftlyin.

Project idea:
Shiftlyin is a college student part-time job portal where verified students can find nearby jobs and local businesses like restaurants, cafes, hotels, shops, and event companies can hire verified students.

Tagline:
Earn While You Learn

Tech stack:
- React.js + Vite
- JavaScript
- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Firebase Cloud Messaging ready structure
- Browser Geolocation API
- CSS responsive design

Create 3 dashboards:
1. Student Dashboard
2. Business Dashboard
3. Admin Dashboard

User roles:
- student
- business
- admin

Required pages:
- Home
- Login
- Register
- StudentDashboard
- BusinessDashboard
- AdminDashboard
- PostJob
- JobDetails
- Applications
- Chat
- Attendance
- Profile

Firebase collections:
- students
- businesses
- admins
- jobs
- applications
- attendance
- chats
- messages
- payments
- reviews
- badges
- notifications
- reports

Student registration fields:
- name
- email
- mobile
- password
- dob
- collegeName
- collegeIdPhoto
- skills
- latitude
- longitude
- profilePhoto
- verificationStatus: pending
- rating
- reputationScore

Business registration fields:
- businessName
- ownerName
- email
- mobile
- password
- businessType
- address
- latitude
- longitude
- shopPhoto
- gstNumber optional
- licensePhoto optional
- verificationStatus: pending

Admin functions:
- verify students
- verify businesses
- view all jobs
- view reports
- manage users

Student dashboard must show:
- nearby jobs
- urgent jobs
- my applications
- accepted jobs
- chat
- GPS check-in/check-out
- wallet placeholder
- ratings
- badges
- notifications
- profile

Business dashboard must show:
- business profile
- post job
- my jobs
- applications
- accepted workers
- chat
- attendance records
- ratings
- analytics placeholder
- notifications

Job posting fields:
- title
- description
- salary
- requiredWorkers
- filledWorkers
- startTime
- endTime
- businessId
- businessName
- businessAddress
- latitude
- longitude
- urgentHiring true/false
- skillsRequired
- status active/completed/expired

Application flow:
- Student can apply for job
- Application status starts as pending
- Business can accept or reject application
- When accepted:
  - application status becomes accepted
  - job filledWorkers increases by 1
  - remaining vacancy updates automatically
  - chat unlocks between student and business
  - notification created for student
- When requiredWorkers equals filledWorkers, job status becomes filled/expired

Chat system:
- Chat only unlocks after application accepted
- Create chats collection with jobId, studentId, businessId
- Create messages subcollection or messages collection
- Show real-time messages using Firestore onSnapshot
- Include senderId, receiverId, message, createdAt, isRead

GPS attendance:
- Student can check-in only for accepted job
- Use browser navigator.geolocation
- Compare student current location with job latitude/longitude
- Use Haversine formula
- Allowed radius: 100 meters
- If within radius, create attendance record:
  - jobId
  - studentId
  - businessId
  - checkInTime
  - checkInLat
  - checkInLng
  - status checked-in
- Check-out:
  - get current GPS
  - update checkOutTime, checkOutLat, checkOutLng
  - calculate workingHours
  - status completed

Rating system:
- Business can rate student after completed attendance
- Fields:
  - attendanceRating
  - behaviorRating
  - workQualityRating
  - punctualityRating
  - averageRating
  - reviewText
- Update student rating and reputationScore

Badge system placeholder:
- 10 completed jobs = Beginner Worker
- 50 completed jobs = Trusted Worker
- 100 completed jobs = Pro Worker
- 200 completed jobs = Elite Worker

Location:
- During business registration location is mandatory
- Give “Use Current Location” button
- Store latitude and longitude
- Use business location as default job location
- Students also store location for nearby jobs
- Show job distance from student using Haversine formula

UI requirements:
- Modern clean startup-style design
- App name Shiftlyin
- Tagline: Earn While You Learn
- Responsive layout
- Separate sidebar/menu for each dashboard
- Cards for jobs, applications, workers, notifications
- Use simple CSS files
- No TypeScript
- Avoid external UI libraries unless necessary

Folder structure:
src/
├── assets/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── JobCard.jsx
│   ├── ApplicationCard.jsx
│   ├── ChatBox.jsx
│   └── ProtectedRoute.jsx
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── StudentDashboard.jsx
│   ├── BusinessDashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── PostJob.jsx
│   ├── JobDetails.jsx
│   ├── Applications.jsx
│   ├── Chat.jsx
│   ├── Attendance.jsx
│   └── Profile.jsx
├── services/
│   └── firebase.js
├── utils/
│   ├── distance.js
│   └── reputation.js
├── styles/
│   ├── App.css
│   ├── Auth.css
│   ├── Dashboard.css
│   └── Cards.css
├── App.jsx
├── main.jsx
└── index.css

Important:
- Give complete working code for all files.
- Include Firebase configuration placeholder in firebase.js.
- Use React Router.
- Create role-based redirect after login.
- Use Firestore CRUD functions.
- Add comments in code for important logic.
- Make MVP working first, then keep placeholders for wallet, notifications, payments, and analytics.
