import React, { useEffect, useState } from "react";
import { auth, db } from "../../components/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify"; // Assuming you have toast for notifications

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [editFormData, setEditFormData] = useState({}); // State to hold editable form data
  const [hasChanges, setHasChanges] = useState(false); // State to track if there are unsaved changes

  // --- Fetch User Data ---
  const fetchUserData = async () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserDetails(data);
            setEditFormData(data); // Initialize edit form with current user data
            setHasChanges(false); // No changes initially
          } else {
            console.log("User data not found in Firestore.");
            setUserDetails(null);
            setEditFormData({});
            setHasChanges(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user profile.", { position: "top-center" });
        }
      } else {
        console.log("No user is logged in.");
        setUserDetails(null);
        setEditFormData({});
        setHasChanges(false);
        // Optionally redirect to login page here if this page requires login
        // window.location.href = "/login";
      }
    });
    return () => unsubscribe(); // Cleanup the listener
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // --- Handle Input Changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      // Check if the new data is different from the original userDetails
      const changesMade = Object.keys(newData).some(key => newData[key] !== userDetails[key]);
      setHasChanges(changesMade);
      return newData;
    });
  };

  // --- Handle Saving Profile Changes ---
  const handleSave = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to save changes.", { position: "top-center" });
      return;
    }
    if (!hasChanges) {
      toast.info("No changes to save.", { position: "top-center" });
      return;
    }

    try {
      const userDocRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        // Remove 'email: editFormData.email,' from here
        // If you had other editable fields, keep them here
      });
      setUserDetails(editFormData); // Update displayed details
      setHasChanges(false); // Reset changes flag
      toast.success("Profile updated successfully!", { position: "top-center" });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. " + error.message, { position: "top-center" });
    }
  };

  // --- Handle Cancelling Changes ---
  const handleCancel = () => {
    setEditFormData(userDetails); // Revert to original data
    setHasChanges(false); // No changes anymore
    toast.info("Changes discarded.", { position: "top-center" });
  };

  // --- Handle Logout ---
  async function handleLogout() {
    try {
      await auth.signOut();
      toast.info("You have been logged out.", { position: "top-center" });
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error.message);
      toast.error("Failed to log out. " + error.message, { position: "top-center" });
    }
  }

  // --- Render Logic ---
  return (
    <div className="profile-container"> {/* Add a class for styling */}
      {userDetails ? (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={userDetails.photo || "https://via.placeholder.com/150"} // Fallback image
              alt="Profile"
              width={"150px"} // Fixed width for consistent look
              height={"150px"} // Fixed height
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
          <h3 style={{ textAlign: "center" }}>Welcome {userDetails.firstName}!</h3>

          <div className="profile-details"> {/* Add a class for styling */}
            {/* Display email as static text */}
            <p><strong>Email:</strong> {auth.currentUser?.email || 'N/A'}</p> 

            <div className="profile-field">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={editFormData.firstName || ''} // Handle potential undefined
                onChange={handleChange}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={editFormData.lastName || ''} // Handle potential undefined
                onChange={handleChange}
              />
            </div>
            {/* Remove the email input field if it was here previously */}
            {/* Add more editable fields here if needed */}

            <div className="profile-actions">
              {hasChanges && ( // Show buttons only if there are changes
                <>
                  <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
                  <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                </>
              )}
              <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </>
      ) : (
        <p style={{ textAlign: "center", marginTop: "50px" }}>Loading profile...</p>
      )}
    </div>
  );
}

export default Profile;