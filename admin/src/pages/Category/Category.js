import React, { useEffect, useState } from 'react';
import './Category.css';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const categoryList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoryList);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCategory.trim() });
      setNewCategory('');
      setShowPopup(false);
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="list add flex-col">
      <div className="header-bar">
        <p className="header">Categories</p>
        <button onClick={() => setShowPopup(true)} className="add-btn">+ Add Category</button>
      </div>
      <hr className="thick-hr" />

      <div className="list-table">
        <div className="list-table-format title">
          <b>ID</b>
          <b>Category Name</b>
          <b>Action</b>
        </div>

        {categories.map((cat) => (
          <div className="list-table-format" key={cat.id}>
            <p>{cat.id}</p>
            <p>{cat.name}</p>
            <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add New Category</h3>
            <input
              type="text"
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="form-buttons">
              <button className="add-btn" onClick={handleAddCategory}>Add</button>
              <button className="add-btn" onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
