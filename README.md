# Institutional Management System

A modern, secure web application for managing students and administrative operations in educational institutions. Built with React, Firebase, and Tailwind CSS.

## Features

### Admin Dashboard
- **Student Management**: Add, edit, and delete student records
- **Fee Management**: Track and manage student fees with payment progress visualization
- **Dashboard Analytics**: View key institutional metrics and statistics
- **Secure Authentication**: Role-based access control with Firebase Authentication
- **Admin Panel**: Clean, professional interface for administrative tasks

### Student Portal
- **Secure Login**: Email and password authentication with password reset capability
- **Fee Information**: View personalized fee breakdown and payment status
- **Student Registration**: Easy signup process for new students
- **Account Security**: Firestore-backed secure data storage

### General Features
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Institutional Branding**: Professional UI emphasizing accountability and transparency
- **Modern Navigation**: Clean navbar with conditional rendering based on user roles
- **Error Boundaries**: Robust error handling with custom error boundaries
- **Role-Based Access Control**: Firestore security rules ensure users can only access their own data

## Tech Stack

- **Frontend**: React 19.2
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 4.1 + Tailwind Vite plugin
- **Authentication**: Firebase 12.8
- **Database**: Firebase Firestore
- **Routing**: React Router DOM 7.12
- **Linting**: ESLint 9.39

## Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm or yarn package manager
- A Firebase project with Firestore enabled
- Firebase credentials (API key, project ID, etc.)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd practice-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a `firebase.js` file in the `src` directory (already exists in this project)
   - Add your Firebase configuration:
   ```javascript
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import {getFirestore} from "firebase/firestore";
    const firebaseConfig = { 
    apiKey: "AIzaSyD35-cWvVTNXaiu1CdXWg4t6yMrVqcgbUY",
    authDomain: "fee-tracking-system-a016f.firebaseapp.com",
    projectId: "fee-tracking-system-a016f",
    storageBucket: "fee-tracking-system-a016f.firebasestorage.app",
    messagingSenderId: "744642278765",
    appId: "1:744642278765:web:44e503e5bc79bde426d664"};

    const app = initializeApp(firebaseConfig);


    export const db = getFirestore(app);
    export const auth = getAuth(app);
   ```

4. **Set up Firestore Rules**
   - Go to Firebase Console → Firestore Database → Rules
   - Apply the following security rules:
   ```firestore
    rules_version = '2';
    service cloud.firestore {
    match /databases/{database}/documents {
        // Helper function to check if user is admin
        function isAdmin() {
        return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
        }

        // Users collection
        match /users/{userId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId 
            && request.resource.data.role == 'student';
        allow write: if request.auth != null && (
            (request.auth.uid == userId && request.resource.data.role == 'student') ||
            isAdmin()
        );
        }

        // Students collection
        match /students/{studentId} {
        allow read, write: if request.auth != null && isAdmin();
        allow read: if request.auth != null && request.auth.uid == studentId;
        }

        match /admins/{adminId} {
        allow read: if request.auth != null && request.auth.uid == adminId;
        }

        match /{document=**} {
        allow read, write: if false;
        }
    }
    }
   ```

5. **Create Firestore Collections**
   - Create collections in Firestore:
     - `admins/` - Admin user documents with role information
     - `students/` - Student records with fees and personal info
     - `users/` - General user data

## Project Structure

```
src/
├── Components/
│   ├── AdminDashboard.jsx      # Admin dashboard with student management
│   ├── AddStudentForm.jsx       # Form for adding new students
│   ├── ErrorBoundary.jsx        # Error boundary wrapper component
│   └── Navbar.jsx               # Top navigation bar
├── Pages/
│   ├── AdminLogin.jsx           # Admin authentication page
│   ├── LandingPage.jsx          # Home page with institution info
│   ├── Register.jsx             # Student registration page
│   ├── StudentLogin.jsx         # Student authentication page
│   └── StudentPortal.jsx        # Student dashboard
├── App.jsx                      # Main app with routing
├── firebase.js                  # Firebase configuration
├── index.css                    # Global styles
└── main.jsx                     # React entry point
```

## Running the Application

### Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## Usage Guide

### For Admins
1. Navigate to the landing page and click "Administrator Login"
2. Enter admin credentials (email and password)
3. Access the admin dashboard to:
   - View all students
   - Add new student records
   - Edit student information and fees
   - Delete student records
   - View dashboard statistics

### For Students
1. Navigate to the landing page and click "Student Portal Access"
2. New students: Click "Register" to create an account
3. Existing students: Enter credentials to login
4. View your fee information and payment status

## Authentication Flow

### Admin Authentication
- Email/password login via Firebase Authentication
- Firestore role verification checks admin status
- Full-page redirect on successful authentication
- Session persisted in localStorage

### Student Authentication
- Email/password signup creates user and student document
- Email/password login verifies credentials
- Session managed through React state and localStorage
- Password reset capability available

## Security Features

- **Role-Based Access Control**: Firestore security rules enforce role-based access
- **Password Protection**: Firebase Authentication handles password security
- **Data Isolation**: Students can only access their own data
- **Admin Verification**: Admin status verified on every critical operation
- **Secure Logout**: Properly clears authentication state

## Key Components

### AdminDashboard.jsx
Comprehensive admin interface with:
- Student management (CRUD operations)
- Dashboard statistics
- Quick action buttons
- Sidebar navigation
- Modal confirmations for deletions

### StudentPortal.jsx
Student-facing dashboard showing:
- Personal information
- Fee breakdown
- Payment progress
- Contact information
- Support resources

### Navbar.jsx
Responsive navigation with:
- Institution logo
- Conditional menu items based on user role
- User profile display
- Logout functionality

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase configuration in `firebase.js`
- Check Firestore security rules allow appropriate access
- Ensure Firebase project has Authentication and Firestore enabled

### Authentication Errors
- Verify admin/student documents exist in Firestore with correct structure
- Check user role is set correctly in admin documents
- Ensure password meets Firebase requirements (minimum 6 characters)

### Permission Denied Errors
- Review Firestore security rules
- Confirm user documents exist in correct collections
- Check that authenticated user UID matches document ID

## Future Enhancements

Potential features for future development:
- Payment integration for fee management
- Email notifications for students
- Advanced reporting and analytics
- Multi-role admin system
- API backend integration
- Mobile app version

## License

This project is licensed under ISC License - see LICENSE file for details.

## Support

For issues or questions, please contact the development team or file an issue in the project repository.
