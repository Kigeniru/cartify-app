import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../firebase"; // Import 'storage'
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Storage functions
import { toast } from "react-toastify";
// import Autocomplete from "react-google-autocomplete"; // Autocomplete not used in the provided code, so commented out

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State for the selected image file

  // --- Helper function to fetch and set user data ---
  // This function is now just a helper, not directly wrapped in the useEffect return.
  const fetchAndSetUserData = async (user) => {
    try {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserDetails(data);
        setEditFormData(data);
        setHasChanges(false);
        setSelectedImage(null); // Clear selected image on new data load
      } else {
        console.log("User data not found in Firestore.");
        setUserDetails(null);
        setEditFormData({});
        setHasChanges(false);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user profile.", { position: "top-center" });
    }
  };

  // --- useEffect for fetching user data and setting up auth state listener ---
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // If a user is logged in, fetch their data
        fetchAndSetUserData(user);
      } else {
        // If no user is logged in, clear state
        console.log("No user is logged in.");
        setUserDetails(null);
        setEditFormData({});
        setHasChanges(false);
        setSelectedImage(null);
        // window.location.href = "/login"; // Optional: Redirect if not logged in
      }
    });

    // Return the unsubscribe function directly from useEffect.
    // This function will be called when the component unmounts.
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // --- Handle Input Changes (for text fields) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => {
      const newData = { ...prevData, [name]: value };
      // Check if new data differs from original userDetails to set hasChanges
      // This ensures 'hasChanges' reflects only text field changes, not just image selection
      const textChangesMade = userDetails
        ? Object.keys(newData).some(
            (key) => newData[key] !== userDetails[key] && key !== "photo" // Exclude photo as it's handled separately
          )
        : false;
      setHasChanges(textChangesMade || !!selectedImage); // Set true if text changes OR an image is selected
      return newData;
    });
  };

  // --- Handle Image File Selection ---
  const handleImageFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      // Mark as having changes if an image is selected
      setHasChanges(true);
    } else {
      setSelectedImage(null);
      // Re-evaluate hasChanges if image selection is cleared
      const textChangesMade = userDetails
        ? Object.keys(editFormData).some(
            (key) => editFormData[key] !== userDetails[key] && key !== "photo"
          )
        : false;
      setHasChanges(textChangesMade); // Set true only if text changes exist
    }
  };

  // --- Handle Uploading Photo to Firebase Storage and Firestore ---
  const handleUploadPhoto = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to upload a photo.", {
        position: "top-center",
      });
      return;
    }
    if (!selectedImage) {
      toast.info("Please select an image first.", { position: "top-center" });
      return;
    }

    const user = auth.currentUser;
    // Create a unique path for the image using user UID and current timestamp
    const imageRef = ref(
      storage,
      `profile_photos/${user.uid}/${Date.now()}_${selectedImage.name}`
    );
    const userDocRef = doc(db, "Users", user.uid);

    try {
      toast.info("Uploading image...", {
        position: "top-center",
        autoClose: false,
        closeButton: false,
      });
      // Upload the image
      const snapshot = await uploadBytes(imageRef, selectedImage);
      // Get the download URL
      const photoURL = await getDownloadURL(snapshot.ref);

      // Update Firestore user document with the new photo URL
      await updateDoc(userDocRef, {
        photo: photoURL,
      });

      // Update local state to reflect new photo instantly
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        photo: photoURL,
      }));
      setSelectedImage(null); // Clear selected image after successful upload
      // Re-evaluate hasChanges for text fields after photo upload
      const textChangesMade = userDetails
        ? Object.keys(editFormData).some(
            (key) => editFormData[key] !== userDetails[key] && key !== "photo"
          )
        : false;
      setHasChanges(textChangesMade); // Reset changes, as photo change is now saved

      toast.dismiss(); // Dismiss the 'uploading' toast
      toast.success("Profile picture updated successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.dismiss(); // Dismiss the 'uploading' toast
      toast.error("Failed to upload photo: " + error.message, {
        position: "top-center",
      });
    }
  };

  // --- Handle Saving Profile Changes (text fields) ---
  const handleSave = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to save changes.", {
        position: "top-center",
      });
      return;
    }

    // Check if there are actual text changes
    const textChangesExist = userDetails
      ? Object.keys(editFormData).some(
          (key) => editFormData[key] !== userDetails[key] && key !== "photo" // Exclude photo
        )
      : false;

    if (!textChangesExist) {
      toast.info("No text changes to save.", { position: "top-center" });
      return;
    }

    try {
      const userDocRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userDocRef, {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        contactInfo: editFormData.contactInfo,
        deliveryInfo: editFormData.deliveryInfo,
      });
      setUserDetails(editFormData); // Update displayed details with the new form data
      setHasChanges(false); // Reset changes flag for text fields
      toast.success("Profile details updated successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. " + error.message, {
        position: "top-center",
      });
    }
  };

  // --- Handle Cancelling Changes ---
  const handleCancel = () => {
    setEditFormData(userDetails); // Revert text fields to original data
    setSelectedImage(null); // Clear any selected image
    setHasChanges(false); // No changes anymore
    toast.info("Changes discarded.", { position: "top-center" });
  };

  // --- Render Logic ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {userDetails ? (
        <div className="flex flex-col md:flex-row items-start gap-8 w-full max-w-4xl">
          {/* Profile Photo Card */}
          <div className="bg-white p-8 rounded-lg shadow-xl w-full md:w-1/3 flex-shrink-0 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">
              Profile Photo
            </h3>
            <div className="flex justify-center mb-6">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : userDetails.photo || "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-500 shadow-md"
              />
            </div>
            <input
              type="file"
              id="profileImageInput"
              accept="image/*"
              style={{ display: "none" }} // Hide the default file input
              onChange={handleImageFileChange}
            />
            <label
              htmlFor="profileImageInput"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer mb-2 inline-block w-full"
            >
              Select Image
            </label>
            {selectedImage && (
              <button
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded w-full mt-2"
                onClick={handleUploadPhoto}
              >
                Upload Photo
              </button>
            )}
          </div>

          {/* User Details Card */}
          <div className="bg-white p-8 rounded-lg shadow-xl w-full md:w-2/3 flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome {userDetails.firstName || "User"}!
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              <strong className="font-semibold">Email:</strong>{" "}
              {auth.currentUser?.email || "N/A"}
            </p>

            <div className="space-y-4">
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={editFormData.firstName || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={editFormData.lastName || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contactInfo"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Contact Number:
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={editFormData.contactInfo || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="deliveryInfo"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Delivery Information:
                </label>
                <input
                  type="text"
                  id="deliveryInfo"
                  name="deliveryInfo"
                  value={editFormData.deliveryInfo || ""}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col space-y-3 mt-6">
                {/* Save Changes button - only enables if there are text changes OR an image is selected */}
                <button
                  className={`font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    hasChanges
                      ? "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                  onClick={handleSave}
                  disabled={!hasChanges} // Enable if 'hasChanges' is true
                >
                  Save Changes
                </button>
                {/* Cancel button - always visible */}
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-700 text-lg mt-12">
          Loading profile...
        </p>
      )}
    </div>
  );
}

export default Profile;