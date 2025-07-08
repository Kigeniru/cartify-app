// src/pages/Product.js (Admin Side)

import React, { useEffect, useState } from 'react';
import './Product.css';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import { toast } from 'react-toastify';


const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  // --- END Pagination States ---

  // --- States for ConfirmModal (for delete) ---
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  // --- END States ---

  const handleDeleteClick = (id) => {
    setProductIdToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (productIdToDelete) {
      try {
        await deleteDoc(doc(db, "products", productIdToDelete));
        toast.success("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product.");
      } finally {
        setShowDeleteConfirmModal(false);
        setProductIdToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setProductIdToDelete(null);
  };

  const handleToggleBestSeller = async (productId, currentStatus) => {
    try {
      const productRef = doc(db, "products", productId);
      const newStatus = !currentStatus;
      await updateDoc(productRef, {
        isBestSeller: newStatus
      });
      toast.success(`Product ${newStatus ? 'added to' : 'removed from'} best sellers!`);
    } catch (error) {
      console.error("Error updating best seller status:", error);
      toast.error("Failed to update best seller status.");
    }
  };

  // NEW: handleToggleAvailability function
  const handleToggleAvailability = async (productId, currentStatus, event) => {
    event.stopPropagation(); // Prevent row click from triggering edit
    try {
      const productRef = doc(db, "products", productId);
      const newStatus = !currentStatus;
      await updateDoc(productRef, {
        isAvailable: newStatus // Update the isAvailable field
      });
      // CHANGED: Toast message
      toast.success(`Product marked as ${newStatus ? 'available' : 'unavailable'}!`);
    } catch (error) {
      console.error("Error updating availability status:", error);
      toast.error("Failed to update availability status.");
    }
  };


  useEffect(() => {
    // Real-time listener for products
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isBestSeller: doc.data().isBestSeller || false, // Ensure isBestSeller is always defined
        isAvailable: doc.data().isAvailable !== undefined ? doc.data().isAvailable : true // NEW: Default to true if not set
      }));
      setProducts(productsArray);
    }, (error) => {
      console.error("Error fetching real-time products:", error);
      toast.error("Error fetching product data!");
    });

    // Fetch categories (can remain getDocs unless categories change frequently)
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categoriesArray = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesArray);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error fetching category data!");
      }
    };

    fetchCategories();

    // Cleanup function for the real-time listener
    return () => unsubscribeProducts();
  }, []);


  const handleRowClick = (productId) => {
    navigate(`/product/edit/${productId}`);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter === '' || product.category === categoryFilter)
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className='list add flex-col'>
      <div className="header-bar">
        <p className='header'>Products</p>
        <button onClick={() => navigate("/product/add")} className='add-btn'>+ Add Product</button>
      </div>
      <hr className="thick-hr" />

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search product..."
          className="search-input"
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="sort-select"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="list-table-prod">
        <div className="list-table-format-prod title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Best Seller</b>
          <b>Availability</b> {/* NEW COLUMN HEADER */}
          <b>Action</b>
        </div>

        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
            <div
              key={product.id}
              className="list-table-format-prod clickable-row"
              onClick={() => handleRowClick(product.id)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <p>{product.name}</p>
              <p>{product.category}</p>
              <p>
                ₱{Number(product.price).toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div>
                <input
                  type="checkbox"
                  checked={product.isBestSeller}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleBestSeller(product.id, product.isBestSeller);
                  }}
                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                />
              </div>
              {/* NEW: Availability Checkbox */}
              <div>
                <input
                  type="checkbox"
                  checked={product.isAvailable}
                  onChange={(e) => handleToggleAvailability(product.id, product.isAvailable, e)}
                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                />
              </div>
              {/* END NEW */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(product.id);
                }}
              >
                <FaTrash className='action-icon' />
              </button>
            </div>
          ))
        ) : (
          <p className="no-products-message">No products found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > productsPerPage && (
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

      {/* Render the ConfirmModal for deletion */}
      <ConfirmModal
        show={showDeleteConfirmModal}
        title="Confirm Product Deletion"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Product;