import React, { useEffect, useState, useRef } from "react";
import { auth, db, storage } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import axios from "axios";
// IMPORTANT: Replace this with the actual path to your ConfirmModal component
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'; 


// Your LocationIQ API Key - IMPORTANT: In a real application, consider using environment variables (e.g., process.env.REACT_APP_LOCATIONIQ_API_KEY)
const LOCATIONIQ_API_KEY = "pk.4646f3385635007025a49229e5e34a4e"; // Replace with your actual key

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // New state for confirm modal

  // --- Helper function to fetch and set user data ---
  const fetchAndSetUserData = async (user) => {
    try {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserDetails(data);
        // Ensure deliveryInfo is an object, even if it was previously a string
        const deliveryInfo = typeof data.deliveryInfo === 'string'
          ? { fullAddress: data.deliveryInfo, components: {} } // Convert old string format
          : data.deliveryInfo || { fullAddress: '', components: {} }; // Default to empty object
        
        setEditFormData({ ...data, deliveryInfo }); // Set editFormData with the normalized deliveryInfo
        setHasChanges(false);
        setSelectedImage(null);
      } else {
        console.log("User data not found in Firestore.");
        setUserDetails(null);
        setEditFormData({ deliveryInfo: { fullAddress: '', components: {} } }); // Initialize deliveryInfo as object
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAndSetUserData(user);
      } else {
        console.log("No user is logged in.");
        setUserDetails(null);
        setEditFormData({ deliveryInfo: { fullAddress: '', components: {} } }); // Initialize deliveryInfo as object
        setHasChanges(false);
        setSelectedImage(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Handle Input Changes (for text fields, including deliveryInfo) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => {
      let newData;
      if (name === "deliveryInfo") {
        // When deliveryInfo is typed manually, update fullAddress and clear components
        newData = {
          ...prevData,
          deliveryInfo: {
            fullAddress: value,
            components: {} // Clear components if user is typing manually
          }
        };
      } else {
        newData = { ...prevData, [name]: value };
      }

      const textChangesMade = userDetails
        ? Object.keys(newData).some(
            (key) => {
              if (key === "deliveryInfo") {
                // Compare fullAddress for deliveryInfo
                return newData.deliveryInfo.fullAddress !== (userDetails.deliveryInfo?.fullAddress || '');
              }
              return newData[key] !== userDetails[key] && key !== "photo";
            }
          )
        : false;
      setHasChanges(textChangesMade || !!selectedImage);
      return newData;
    });

    // If the changed field is deliveryInfo, trigger autocomplete
    if (name === "deliveryInfo" && value.length > 2) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        fetchAddressSuggestions(value);
      }, 500); // Debounce for 500ms
    } else if (name === "deliveryInfo" && value.length <= 2) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // --- Function to fetch address suggestions from LocationIQ ---
  const fetchAddressSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/autocomplete.php`,
        {
          params: {
            key: LOCATIONIQ_API_KEY,
            q: query,
            limit: 5,
            dedupe: 1,
            addressdetails: 1, // <--- IMPORTANT: Request detailed address components
            // countrycodes: 'ph' // Uncomment if you want to restrict to Philippines
          },
        }
      );
      if (response.data && Array.isArray(response.data)) {
        setAddressSuggestions(response.data);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching address suggestions:", error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // --- Handle selection of an address suggestion ---
  const handleSelectSuggestion = (suggestion) => {
    setEditFormData((prevData) => ({
      ...prevData,
      deliveryInfo: {
        fullAddress: suggestion.display_name,
        components: suggestion.address || {} // Store the structured address object
      },
    }));
    setAddressSuggestions([]);
    setShowSuggestions(false);
    setHasChanges(true); // Mark as having changes
  };

  // --- Handle Image File Selection ---
  const handleImageFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setHasChanges(true);
    } else {
      setSelectedImage(null);
      const textChangesMade = userDetails
        ? Object.keys(editFormData).some(
            (key) => {
              if (key === "deliveryInfo") {
                return editFormData.deliveryInfo.fullAddress !== (userDetails.deliveryInfo?.fullAddress || '');
              }
              return editFormData[key] !== userDetails[key] && key !== "photo";
            }
          )
        : false;
      setHasChanges(textChangesMade);
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
      const snapshot = await uploadBytes(imageRef, selectedImage);
      const photoURL = await getDownloadURL(snapshot.ref);

      await updateDoc(userDocRef, {
        photo: photoURL,
      });

      setUserDetails((prevDetails) => ({
        ...prevDetails,
        photo: photoURL,
      }));
      setSelectedImage(null);
      const textChangesMade = userDetails
        ? Object.keys(editFormData).some(
            (key) => {
              if (key === "deliveryInfo") {
                return editFormData.deliveryInfo.fullAddress !== (userDetails.deliveryInfo?.fullAddress || '');
              }
              return editFormData[key] !== userDetails[key] && key !== "photo";
            }
          )
        : false;
      setHasChanges(textChangesMade);

      toast.dismiss();
      toast.success("Profile picture updated successfully!", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.dismiss();
      toast.error("Failed to upload photo: " + error.message, {
        position: "top-center",
      });
    }
  };

  // --- Handle Saving Profile Changes (initiates modal) ---
  const handleSave = () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to save changes.", {
        position: "top-center",
      });
      return;
    }

    const textChangesExist = userDetails
      ? Object.keys(editFormData).some(
          (key) => {
            if (key === "deliveryInfo") {
              const oldFullAddress = userDetails.deliveryInfo?.fullAddress || '';
              const newFullAddress = editFormData.deliveryInfo?.fullAddress || '';
              const oldComponents = userDetails.deliveryInfo?.components || {};
              const newComponents = editFormData.deliveryInfo?.components || {};
              return (
                oldFullAddress !== newFullAddress ||
                JSON.stringify(oldComponents) !== JSON.stringify(newComponents)
              );
            }
            return editFormData[key] !== userDetails[key] && key !== "photo";
          }
        )
      : false;

    if (!textChangesExist) {
      toast.info("No text changes to save.", { position: "top-center" });
      return;
    }

    setShowConfirmModal(true); // Show the confirmation modal
  };

  // --- Handle Confirm Save (actual save logic) ---
  const handleConfirmSave = async () => {
    setShowConfirmModal(false); // Close the modal

    try {
      const userDocRef = doc(db, "Users", auth.currentUser.uid);
      const dataToSave = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        contactInfo: editFormData.contactInfo,
        deliveryInfo: editFormData.deliveryInfo,
      };
      await updateDoc(userDocRef, dataToSave);
      setUserDetails(dataToSave);
      setHasChanges(false);
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

  // --- Handle Cancel Save (from modal) ---
  const handleCancelSave = () => {
    setShowConfirmModal(false); // Just close the modal
  };

  // --- Handle Cancelling Changes (from main form) ---
  const handleCancel = () => {
    const originalDeliveryInfo = typeof userDetails.deliveryInfo === 'string'
      ? { fullAddress: userDetails.deliveryInfo, components: {} }
      : userDetails.deliveryInfo || { fullAddress: '', components: {} };

    setEditFormData({ ...userDetails, deliveryInfo: originalDeliveryInfo });
    setSelectedImage(null);
    setHasChanges(false);
    setAddressSuggestions([]);
    setShowSuggestions(false);
    toast.info("Changes discarded.", { position: "top-center" });
  };

  // --- Render Logic ---
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans antialiased">
      {userDetails ? (
        <div className="flex flex-col md:flex-row items-start gap-8 w-full max-w-4xl">
          {/* Profile Photo Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-1/3 flex-shrink-0 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-4">
              Profile Photo
            </h3>
            <div className="flex justify-center mb-6">
              <img
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : userDetails.photo || "https://placehold.co/150x150/E0E7FF/4F46E5?text=Profile"
                }
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-400 shadow-md"
              />
            </div>
            <input
              type="file"
              id="profileImageInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageFileChange}
            />
            <label
              htmlFor="profileImageInput"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer mb-2 inline-block w-full transition duration-200 ease-in-out"
            >
              Select Image
            </label>
            {selectedImage && (
              <button
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg w-full mt-2 transition duration-200 ease-in-out"
                onClick={handleUploadPhoto}
              >
                Set Profile Photo
              </button>
            )}
          </div>

          {/* User Details Card */}
          <div className="bg-white p-8 rounded-xl shadow-lg w-full md:w-2/3 flex-grow">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome {userDetails.firstName || "User"}!
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              <strong className="font-semibold">Email:</strong>{" "}
              {auth.currentUser?.email || "N/A"}
            </p>

            <div className="space-y-5">
              <div className="mb-4">
                <label
                  htmlFor="firstName"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={editFormData.firstName || ""}
                  onChange={handleChange}
                  className="appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="lastName"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={editFormData.lastName || ""}
                  onChange={handleChange}
                  className="appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contactInfo"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Contact Number:
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={editFormData.contactInfo || ""}
                  onChange={handleChange}
                  className="appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out"
                />
              </div>

              <div className="mb-4 relative">
                <label
                  htmlFor="deliveryInfo"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Delivery Information:
                </label>
                <input
                  type="text"
                  id="deliveryInfo"
                  name="deliveryInfo"
                  value={editFormData.deliveryInfo?.fullAddress || ""}
                  onChange={handleChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out"
                />
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion) => (
                      <li
                        key={suggestion.place_id}
                        onMouseDown={() => handleSelectSuggestion(suggestion)}
                        className="p-2 cursor-pointer hover:bg-gray-100 border-b border-gray-200 last:border-b-0 text-gray-800"
                      >
                        {suggestion.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-200 ease-in-out w-full md:w-auto"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className={`font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-200 ease-in-out w-full md:w-auto ${
                    hasChanges
                      ? "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                  onClick={handleSave} // This now triggers the modal
                  disabled={!hasChanges}
                >
                  Update Profile
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

      {/* Confirmation Modal */}
      <ConfirmModal
        show={showConfirmModal}
        message="Are you sure you want to update your profile details?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />
    </div>
  );
}

export default Profile;
