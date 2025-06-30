import React, { useEffect, useState } from 'react';
import './Add.css';
import { db, storage } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

import upload from '../../assets/upload_area.png';

const Add = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  // ✅ Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        const categoryList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoryList);
        if (categoryList.length > 0) {
          setData(data => ({ ...data, category: categoryList[0].name })); // default selection
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!image) {
        alert("Please upload an image.");
        return;
      }

      const imageRef = ref(storage, `product-images/${uuidv4()}-${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "products"), {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        imageUrl: imageUrl,
        createdAt: new Date()
      });

      alert("Product added successfully!");
      navigate('/product');
      setData({ name: "", description: "", price: "", category: categories[0]?.name || "" });
      setImage(null);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate('/product');
  };

  return (
    <div className='add'>
      <p className='header'>Add Products</p>
      <hr className="thick-hr" />

      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src={image ? URL.createObjectURL(image) : upload} alt="" />
          </label>
          <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden required />
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea onChange={onChangeHandler} value={data.description} name='description' rows="6" placeholder='Write content here' />
        </div>

        <div className="add-category-price">
          <div className='add-category flex-col'>
            <p>Product Category</p>
            <select onChange={onChangeHandler} name="category" value={data.category}>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input onChange={onChangeHandler} value={data.price} type="number" name="price" placeholder="₱20" />
          </div>
        </div>

        <div className="add-buttons-row">
          <button type='submit' className='add-btn'>Add</button>
          <button type='button' className='add-btn' onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Add;
