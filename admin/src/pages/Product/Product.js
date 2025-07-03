import React, { useEffect, useState } from 'react';
import './Product.css';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'; // Import ConfirmModal
import { toast } from 'react-toastify'; // Import toast


const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // Limit to 10 products per page
  // --- END Pagination States ---

  // --- NEW States for ConfirmModal (for delete) ---
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);
  // --- END NEW States ---

  // --- MODIFIED: handleDelete now opens ConfirmModal ---
  const handleDeleteClick = (id) => {
    setProductIdToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  // --- NEW: handleConfirmDelete for the modal's confirm action ---
  const handleConfirmDelete = async () => {
    if (productIdToDelete) {
      try {
        await deleteDoc(doc(db, "products", productIdToDelete));
        setProducts((prev) => prev.filter(product => product.id !== productIdToDelete));
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

  // --- NEW: handleCancelDelete for the modal's cancel action ---
  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setProductIdToDelete(null);
  };
  // --- END NEW ---

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productSnapshot = await getDocs(collection(db, "products"));
        const productsArray = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsArray);

        // Fetch categories
        const categorySnapshot = await getDocs(collection(db, "categories"));
        const categoriesArray = categorySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesArray);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching product data!"); // Added toast
      }
    };

    fetchData();
  }, []);

  // --- NEW: handleRowClick for navigation to edit page ---
  const handleRowClick = (productId) => {
    navigate(`/product/edit/${productId}`);
  };

  // --- Pagination Logic ---
  // Filter and search products first
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search) &&
    (categoryFilter === '' || product.category === categoryFilter)
  );

  // Get current products for the page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  // --- END Pagination Logic ---

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
            setSearch(e.target.value.toLowerCase());
            setCurrentPage(1); // Reset to first page on search
          }}
        />

        <select
          className="sort-select"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1); // Reset to first page on category filter
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="list-table-prod">
        <div className="list-table-format-prod title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
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