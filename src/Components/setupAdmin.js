// setupAdmin.js - Run this in your browser console when logged into Firebase
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function setupAdminAccount(email, password, adminName = "System Administrator") {
  try {
    console.log("Creating admin account...");
    
    // 1. Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    console.log("✅ Firebase Auth user created:", uid);
    
    // 2. Create admin document in Firestore
    await setDoc(doc(db, "admins", uid), {
      uid: uid,
      email: email,
      role: "super_admin",
      name: adminName,
      createdAt: new Date(),
      isActive: true,
      permissions: ["all", "users", "students", "fees", "reports"],
      lastLogin: null
    });
    
    console.log("✅ Admin document created in Firestore");
    console.log("🎉 Admin setup complete!");
    console.log("Email:", email);
    console.log("Password:", password);
    
    return { success: true, uid, email };
  } catch (error) {
    console.error("❌ Error creating admin:", error);
    return { success: false, error: error.message };
  }
}

