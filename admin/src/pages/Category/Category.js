import React, { useEffect, useState } from 'react';
import './Category.css';
import { db } from '../../firebase';
// Import query, where, and writeBatch for cascading update
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { FaTrash, FaEdit } from "react-icons/fa";
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { toast } from 'react-toastify';


const Category = () => {
  const [categories, setCategories] = useState([]);
  const [showAddEditCategoryPopup, setShowAddEditCategoryPopup] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  // This state is crucial: it holds the name of the category *before* editing
  const [originalCategoryName, setOriginalCategoryName] = useState('');

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
  const [categoryNameForDeletion, setCategoryNameForDeletion] = useState('');


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
      toast.error('Failed to fetch categories.');
    }
  };

  // --- MODIFIED: handleSaveCategory for cascading update on edit ---
  const handleSaveCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    // Prevent update if the new name is exactly the same as the old one (and we are editing)
    if (editingCategoryId && newCategory.trim() === originalCategoryName) {
        toast.info("Category name is the same. No update needed.");
        handleCancelAddEdit(); // Just close the popup
        return;
    }

    const batch = writeBatch(db); // Initialize batch for all operations

    try {
      if (editingCategoryId) {
        // --- EDIT LOGIC ---
        const categoryRef = doc(db, 'categories', editingCategoryId);
        
        // 1. Update the category document itself
        batch.update(categoryRef, { name: newCategory.trim() });

        // 2. If the category name has changed, update associated products
        if (newCategory.trim() !== originalCategoryName) {
          const productsRef = collection(db, 'products');
          // Query for products that have the OLD category name
          const q = query(productsRef, where('category', '==', originalCategoryName));
          const productSnapshot = await getDocs(q);

          productSnapshot.docs.forEach((productDoc) => {
            // Update each product's category field to the NEW category name
            batch.update(productDoc.ref, { category: newCategory.trim() });
          });
        }
        
        await batch.commit(); // Commit the batch
        toast.success(`Category '${originalCategoryName}' updated to '${newCategory}' successfully!`);

      } else {
        // --- ADD LOGIC (no change here, but still uses batch for consistency if needed for future features) ---
        batch.set(doc(collection(db, 'categories')), { name: newCategory.trim() }); // Use set for new doc in batch
        await batch.commit(); // Commit the batch
        toast.success('Category added successfully!');
      }

      setNewCategory(''); // Clear input
      setShowAddEditCategoryPopup(false); // Close popup
      setEditingCategoryId(null); // Reset editing state
      setOriginalCategoryName(''); // Clear original name
      fetchCategories(); // Re-fetch to update the list
    } catch (err) {
      console.error(`Error ${editingCategoryId ? 'updating' : 'adding'} category:`, err);
      toast.error(`Failed to ${editingCategoryId ? 'update' : 'add'} category.`);
    }
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category.id);
    setNewCategory(category.name); // Pre-fill input with current name
    setOriginalCategoryName(category.name); // Store original name for comparison later
    setShowAddEditCategoryPopup(true); // Open the popup
  };

  const handleAddClick = () => {
    setEditingCategoryId(null); // Ensure no category is being edited
    setNewCategory(''); // Clear input for new category
    setOriginalCategoryName(''); // Clear original name
    setShowAddEditCategoryPopup(true); // Open the popup
  };

  const handleDeleteClick = (category) => {
    setCategoryIdToDelete(category.id);
    setCategoryNameForDeletion(category.name);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (categoryIdToDelete && categoryNameForDeletion) {
      const batch = writeBatch(db);

      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('category', '==', categoryNameForDeletion));
        const productSnapshot = await getDocs(q);

        productSnapshot.docs.forEach((productDoc) => {
          batch.delete(productDoc.ref);
        });

        const categoryDocRef = doc(db, 'categories', categoryIdToDelete);
        batch.delete(categoryDocRef);

        await batch.commit();

        setCategories(prev => prev.filter(cat => cat.id !== categoryIdToDelete));
        toast.success(`Category '${categoryNameForDeletion}' and its products deleted successfully!`);

      } catch (err) {
        console.error('Error performing cascading delete:', err);
        toast.error('Failed to delete category and associated products.');
      } finally {
        setShowDeleteConfirmModal(false);
        setCategoryIdToDelete(null);
        setCategoryNameForDeletion('');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setCategoryIdToDelete(null);
    setCategoryNameForDeletion('');
  };

  const handleCancelAddEdit = () => {
    setShowAddEditCategoryPopup(false);
    setEditingCategoryId(null);
    setNewCategory('');
    setOriginalCategoryName('');
  };


  return (
    <div className="list add flex-col">
      <div className="header-bar">
        <p className="header">Categories</p>
        <button onClick={handleAddClick} className="add-btn">+ Add Category</button>
      </div>
      <hr className="thick-hr" />

      <div className="list-table-cat">
        <div className="list-table-format-cat title">
          <b>ID</b>
          <b>Category Name</b>
          <b>Action</b>
        </div>

        {categories.map((cat) => (
          <div
            className="list-table-format-cat clickable-row"
            key={cat.id}
            onClick={() => handleEditClick(cat)}
          >
            <p>{cat.id}</p>
            <p>{cat.name}</p>
            <div className="category-actions">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(cat);
                }}
              >
                <FaTrash className='action-icon delete-icon' />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddEditCategoryPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h3>
            <input
              type="text"
              className='cat-bar'
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="form-buttons">
              <button className="add-btn-cat" onClick={handleSaveCategory}>
                {editingCategoryId ? 'Update' : 'Add'}
              </button>
              <button className="add-btn-cat" onClick={handleCancelAddEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showDeleteConfirmModal}
        title="Confirm Category Deletion"
        message={`Are you sure you want to delete the category '${categoryNameForDeletion}' and ALL its associated products? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Category;