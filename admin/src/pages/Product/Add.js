import React, { useEffect, useState } from 'react';
import './Add.css'; // Keep the same CSS or create a new one if styling needs to differ
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'; // Import getDoc and updateDoc
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import upload from '../../assets/upload_area.png';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { toast } from 'react-toastify';

const Add = () => { // Renamed component
  const navigate = useNavigate();
  const { productId } = useParams(); // Get product ID from URL params
  const isEditing = !!productId; // Check if we are in edit mode

  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [existingImageUrl, setExistingImageUrl] = useState(''); // To display existing image in edit mode

  const [lightHue, setLightHue] = useState(0); // hue: 0–360
  const [darkHue, setDarkHue] = useState(200); // deeper

  // These will be derived from lightHue and darkHue
  const lightColor = `hsl(${lightHue}, 60%, 80%)`; // pastel/light
  const darkColor = `hsl(${darkHue}, 85%, 50%)`;   // deeper

  const [showConfirmActionModal, setShowConfirmActionModal] = useState(false); // Combined confirm modal state
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalActionType, setModalActionType] = useState(null); // 'add' or 'edit'

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoryList);

        // If in edit mode, fetch existing product data
        if (isEditing && productId) {
          const productRef = doc(db, 'products', productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const productData = productSnap.data();
            setData({
              name: productData.name || "",
              description: productData.description || "",
              price: productData.price ? Number(productData.price).toFixed(2) : "", // Ensure price is formatted
              category: productData.category || (categoryList.length > 0 ? categoryList[0].name : ""),
            });
            setExistingImageUrl(productData.imageUrl || '');
            // Set existing colors if available, otherwise use defaults
            setLightHue(productData.lightColor ? parseInt(productData.lightColor.match(/\d+/)[0]) : 0);
            setDarkHue(productData.darkColor ? parseInt(productData.darkColor.match(/\d+/)[0]) : 200);

          } else {
            toast.error("Product not found!");
            navigate('/product'); // Navigate back if product doesn't exist
          }
        } else if (categoryList.length > 0) {
          // If adding and no category is selected, default to the first one
          setData(data => ({ ...data, category: categoryList[0].name }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data!");
      }
    };
    fetchData();
  }, [isEditing, productId, navigate]); // Add dependencies

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    if (name === 'price') {
      const numericValue = value.replace(/[₱,]/g, '');
      if (!isNaN(numericValue) || numericValue === '') {
        setData((prevData) => ({ ...prevData, [name]: numericValue }));
      }
    } else {
      setData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    if (e.target.name === 'price') {
      const number = parseFloat(data.price);
      if (!isNaN(number)) {
        setData((prevData) => ({
          ...prevData,
          price: number.toFixed(2),
        }));
      }
    }
  };

  // --- MODIFIED: onSubmitHandler now opens the modal with dynamic content ---
  const onSubmitHandler = async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Perform initial validation before showing the modal
    if (!image && !existingImageUrl) { // Check for image only if not editing OR no existing image
      toast.error("Please upload an image for the product.");
      return;
    }
    if (!data.name || !data.description || !data.price || !data.category) {
      toast.error("Please fill in all product details.");
      return;
    }

    if (isEditing) {
      setModalTitle("Confirm Product Update");
      setModalMessage("Are you sure you want to update this product?");
      setModalActionType('edit');
    } else {
      setModalTitle("Confirm Product Addition");
      setModalMessage("Are you sure you want to add this product?");
      setModalActionType('add');
    }
    setShowConfirmActionModal(true); // Show the confirmation modal
  };

  // --- NEW: handleConfirmAction for the modal's confirm action (unified) ---
  const handleConfirmAction = async () => {
    setShowConfirmActionModal(false); // Close the modal immediately

    try {
      let finalImageUrl = existingImageUrl;

      // Only upload new image if one is selected
      if (image) {
        const imageRef = ref(storage, `product-images/${uuidv4()}-${image.name}`);
        await uploadBytes(imageRef, image);
        finalImageUrl = await getDownloadURL(imageRef);
      } else if (!existingImageUrl && !image) {
          // This case should be caught by the onSubmitHandler validation, but as a fallback
          toast.error("Image is missing. Please select an image.");
          return;
      }

      const productDataToSave = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        imageUrl: finalImageUrl,
        lightColor: lightColor, // Save HSL string
        darkColor: darkColor,   // Save HSL string
        // createdAt should only be set on add, not update
      };

      if (modalActionType === 'add') {
        await addDoc(collection(db, "products"), {
          ...productDataToSave,
          createdAt: new Date() // Set creation date only on add
        });
        toast.success("Product added successfully!");
      } else if (modalActionType === 'edit') {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, productDataToSave); // Update only the relevant fields
        toast.success("Product updated successfully!");
      }

      navigate('/product');
      // Reset form data after successful submission only if adding
      if (modalActionType === 'add') {
        setData({ name: "", description: "", price: "", category: categories[0]?.name || "" });
        setImage(null);
        setLightHue(0);
        setDarkHue(200);
      }
    } catch (error) {
      console.error(`Error ${modalActionType}ing product:`, error);
      toast.error(`Failed to ${modalActionType} product. Please try again.`);
    }
  };

  // --- NEW: handleCancelAction for the modal's cancel action (unified) ---
  const handleCancelAction = () => {
    setShowConfirmActionModal(false); // Just close the modal
    setModalActionType(null); // Reset action type
  };
  // --- END NEW ---

  const handleCancel = () => {
    navigate('/product');
  };

  return (
    <div className='add'>
      <p className='header'>{isEditing ? 'Edit Product' : 'Add Products'}</p> {/* Dynamic header */}
      <hr className="thick-hr" />

      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : (existingImageUrl || upload)} alt="" /> {/* Show existing image */}
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden /> {/* `required` removed as existing image might be used */}
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input className='input-style' onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' required />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea className='input-style' onChange={onChangeHandler} value={data.description} name='description' rows="6" placeholder='Write content here' required />
        </div>

        <div className="add-category-price">
          <div className='add-category flex-col'>
            <p>Product Category</p>
            <select className='input-style' onChange={onChangeHandler} name="category" value={data.category} required>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input
            className='input-style'
              onChange={onChangeHandler}
              onBlur={handleBlur}
              value={data.price}
              name="price"
              placeholder="₱20.00"
              required
            />
          </div>
        </div>

        <div className="color-section">
          <div className="color-picker flex-col">
            <p>Light Color (Hue Slider)</p>
            <input
              type="range"
              min="0"
              max="360"
              value={lightHue}
              onChange={(e) => setLightHue(Number(e.target.value))}
              className="rainbow-slider"
            />
            <div
              className="color-preview"
              style={{ backgroundColor: lightColor }}
            />
          </div>

          <div className="color-picker flex-col">
            <p>Dark Color (Hue Slider)</p>
            <input
              type="range"
              min="0"
              max="360"
              value={darkHue}
              onChange={(e) => setDarkHue(Number(e.target.value))}
              className="rainbow-slider"
            />
            <div
              className="color-preview"
              style={{ backgroundColor: darkColor }}
            />
          </div>

          <div className="gradient-preview-container">
            <p>Live Gradient Preview</p>
            <div
              className="gradient-preview"
              style={{
                background: `linear-gradient(to right, ${lightColor}, ${darkColor})`
              }}
            />
          </div>
        </div>

        <div className="add-buttons-row">
          <button type='submit' className='add-btn'>{isEditing ? 'Update' : 'Add'}</button> {/* Dynamic button text */}
          <button type='button' className='add-btn' onClick={handleCancel}>Cancel</button>
        </div>
      </form>

      {/* --- Render the ConfirmModal for adding/editing product --- */}
      <ConfirmModal
        show={showConfirmActionModal}
        title={modalTitle}
        message={modalMessage}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </div>
  );
};

export default Add; // Export with new name