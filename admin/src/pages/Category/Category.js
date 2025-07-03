import React, { useEffect, useState } from 'react';
import './Category.css';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { FaTrash, FaEdit } from "react-icons/fa";
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { toast } from 'react-toastify';


const Category = () => {
  const [categories, setCategories] = useState([]);
  const [showAddEditCategoryPopup, setShowAddEditCategoryPopup] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [originalCategoryName, setOriginalCategoryName] = useState('');

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
  const [categoryNameForDeletion, setCategoryNameForDeletion] = useState('');

  // --- NEW: Search and Pagination States ---
  const [searchCategory, setSearchCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage] = useState(10); // Limit to 10 categories per page
  const CATEGORY_NAME_MAX_LENGTH = 100; // Define max length for category name
  // --- END NEW States ---


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

  // --- NEW: Function to check for duplicate category name ---
  const checkIfCategoryNameExists = async (categoryName, excludeCategoryId = null) => {
    const categoriesRef = collection(db, "categories");
    // Query for category with the exact name (case-sensitive as per Firestore where clause)
    // If you need case-insensitive, you'd store a 'normalizedName' field (lowercase) in Firestore.
    const q = query(categoriesRef, where("name", "==", categoryName));
    const querySnapshot = await getDocs(q);

    if (excludeCategoryId) {
      // If editing, allow the currently edited category to keep its name
      const docs = querySnapshot.docs.filter(doc => doc.id !== excludeCategoryId);
      return docs.length > 0; // Returns true if any OTHER category has this name
    }

    return !querySnapshot.empty; // Returns true if any category (including the one being added) has this name
  };


  const handleSaveCategory = async () => {
    const trimmedCategoryName = newCategory.trim();

    if (!trimmedCategoryName) {
      toast.error("Category name cannot be empty.");
      return;
    }
    if (trimmedCategoryName.length > CATEGORY_NAME_MAX_LENGTH) {
      toast.error(`Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters.`);
      return;
    }

    // Prevent update if the new name is exactly the same as the old one (and we are editing)
    if (editingCategoryId && trimmedCategoryName === originalCategoryName) {
        toast.info("Category name is the same. No update needed.");
        handleCancelAddEdit(); // Just close the popup
        return;
    }

    // --- NEW: Check for duplicate name before saving ---
    try {
      const isDuplicate = await checkIfCategoryNameExists(trimmedCategoryName, editingCategoryId);
      if (isDuplicate) {
        toast.error(`Category with name "${trimmedCategoryName}" already exists.`);
        return; // Stop the save operation
      }
    } catch (error) {
      console.error("Error checking for duplicate category name:", error);
      toast.error("Failed to check for duplicate category name.");
      return;
    }
    // --- END NEW Duplicate Check ---


    const batch = writeBatch(db); // Initialize batch for all operations

    try {
      if (editingCategoryId) {
        // --- EDIT LOGIC ---
        const categoryRef = doc(db, 'categories', editingCategoryId);
        
        // 1. Update the category document itself
        batch.update(categoryRef, { name: trimmedCategoryName });

        // 2. If the category name has changed, update associated products
        if (trimmedCategoryName !== originalCategoryName) {
          const productsRef = collection(db, 'products');
          // Query for products that have the OLD category name
          const q = query(productsRef, where('category', '==', originalCategoryName));
          const productSnapshot = await getDocs(q);

          productSnapshot.docs.forEach((productDoc) => {
            // Update each product's category field to the NEW category name
            batch.update(productDoc.ref, { category: trimmedCategoryName });
          });
        }
        
        await batch.commit(); // Commit the batch
        toast.success(`Category '${originalCategoryName}' updated to '${trimmedCategoryName}' successfully!`);

      } else {
        // --- ADD LOGIC ---
        batch.set(doc(collection(db, 'categories')), { name: trimmedCategoryName }); // Use set for new doc in batch
        await batch.commit(); // Commit the batch
        toast.success('Category added successfully!');
      }

      setNewCategory(''); // Clear input
      setShowAddEditCategoryPopup(false); // Close popup
      setEditingCategoryId(null); // Reset editing state
      setOriginalCategoryName(''); // Clear original name
      fetchCategories(); // Re-fetch to update the list
      setCurrentPage(1); // Reset pagination to first page
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
          batch.delete(productDoc.ref); // Delete associated products
        });

        const categoryDocRef = doc(db, 'categories', categoryIdToDelete);
        batch.delete(categoryDocRef); // Delete the category itself

        await batch.commit();

        setCategories(prev => prev.filter(cat => cat.id !== categoryIdToDelete));
        toast.success(`Category '${categoryNameForDeletion}' and its products deleted successfully!`);
        setCurrentPage(1); // Reset pagination after delete
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

  // --- NEW: Pagination & Search Logic ---
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // --- END NEW Logic ---


  return (
    <div className="list add flex-col">
      <div className="header-bar">
        <p className="header">Categories</p>
        <button onClick={handleAddClick} className="add-btn">+ Add Category</button>
      </div>
      <hr className="thick-hr" />

      {/* --- NEW: Search Bar --- */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search categories..."
          className="search-input"
          value={searchCategory}
          onChange={(e) => {
            setSearchCategory(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        />
      </div>
      {/* --- END NEW Search Bar --- */}

      <div className="list-table-cat">
        <div className="list-table-format-cat title">
          <b>ID</b>
          <b>Category Name</b>
          <b>Action</b>
        </div>

        {currentCategories.length > 0 ? (
          currentCategories.map((cat) => (
            <div
              className="list-table-format-cat clickable-row"
              key={cat.id}
              onClick={() => handleEditClick(cat)}
            >
              <p className="category-id-col">{cat.id}</p> {/* Added a class for potential styling */}
              <p>{cat.name}</p>
              <div className="category-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click from triggering edit
                    handleDeleteClick(cat);
                  }}
                >
                  <FaTrash className='action-icon delete-icon' />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-items-message">No categories found.</p>
        )}
      </div>

      {/* --- NEW: Pagination Controls --- */}
      {filteredCategories.length > categoriesPerPage && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
      {/* --- END NEW Pagination Controls --- */}

      {showAddEditCategoryPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h3>
            <input
              type="text"
              className='cat-bar'
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => {
                // Enforce character limit directly in the input
                const value = e.target.value;
                if (value.length <= CATEGORY_NAME_MAX_LENGTH) {
                  setNewCategory(value);
                } else {
                  toast.warn(`Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters.`);
                }
              }}
              maxLength={CATEGORY_NAME_MAX_LENGTH} // HTML attribute for visual limit
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