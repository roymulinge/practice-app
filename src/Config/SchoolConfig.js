// src/config/schoolConfig.js
export const SCHOOL_CONFIG = {
  // Same class options for both admin and student
  classOptions: [
    "Form 1A", "Form 1B", "Form 1C", "Form 1D",
    "Form 2A", "Form 2B", "Form 2C", "Form 2D",
    "Form 3A", "Form 3B", "Form 3C", "Form 3D",
    "Form 4A", "Form 4B", "Form 4C", "Form 4D",
    "Grade 9A", "Grade 9B", "Grade 9C",
    "Grade 10A", "Grade 10B", "Grade 10C",
    "Grade 11A", "Grade 11B", "Grade 11C",
    "Grade 12A", "Grade 12B", "Grade 12C",
    "Other"
  ],
  
  // Default password for admin-created students
   defaultPassword: "DEST@2024",

  
  // Admission number format
  admissionPrefix: "DEST",
  currentYear: new Date().getFullYear()
};

// Helper function to generate admission number
export const generateAdmissionNumber = (count) => {
  const { admissionPrefix, currentYear } = SCHOOL_CONFIG;
  const sequence = String(count).padStart(4, '0');
  return `${admissionPrefix}/${currentYear}/${sequence}`;
};