// src/utils/firebaseErrorTranslator.js

const translateFirebaseError = (code) => {
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Try logging in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/network-request-failed": "Check your internet connection.",
    "auth/internal-error": "Something went wrong. Please try again.",
  };

  return messages[code] || "Something went wrong. Please try again.";
};

export default translateFirebaseError;
