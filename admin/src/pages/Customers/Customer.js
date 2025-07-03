import React, { useEffect, useState } from 'react';
import './Customer.css';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash } from "react-icons/fa";

// Import the new ConfirmModal component
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'; // Adjust path if necessary

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const customersPerPage = 10;

  // --- NEW State for Modal ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  // --- END NEW State ---

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'Users'));
        const usersArray = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(usersArray);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error fetching users.");
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  // --- MODIFIED: Open modal instead of direct confirm ---
  const handleDeleteClick = (userId) => {
    setUserToDeleteId(userId); // Store the ID of the user to be deleted
    setShowConfirmModal(true); // Show the confirmation modal
  };

  // --- NEW: handleConfirmDelete for the modal's confirm action ---
  const handleConfirmDelete = async () => {
    if (userToDeleteId) { // Ensure there's an ID to delete
      try {
        await deleteDoc(doc(db, 'Users', userToDeleteId));
        setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== userToDeleteId));
        toast.success("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Error deleting user.");
      } finally {
        // Always close the modal and reset the ID after attempt
        setShowConfirmModal(false);
        setUserToDeleteId(null);
      }
    }
  };

  // --- NEW: handleCancelDelete for the modal's cancel action ---
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setUserToDeleteId(null);
  };
  // --- END NEW ---

  const filteredCustomers = customers.filter(user =>
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm) ||
    (user.email && user.email.toLowerCase().includes(searchTerm))
  );

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className='list add flex-col'>
      <p className='header'>Users</p>
      <hr className="thick-hr" />
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={handleSearch}
        className='search-bar'
      />

      <div className="list-table-user">
        <div className="list-table-format-user title">
          <b>User ID</b>
          <b>Name</b>
          <b>Email</b>
          <b>Contact Info</b>
          <b>Action</b>
        </div>

        {currentCustomers.map(user => (
          <div key={user.id} className="list-table-format-user">
            <p>user_{user.id}</p>
            <p>{user.firstName} {user.lastName}</p>
            <p>{user.email}</p>
            <p>{user.contactInfo}</p>
            <p className='cursor-pointer' onClick={() => handleDeleteClick(user.id)}>
              <FaTrash className="action-icon" />
            </p>
          </div>
        ))}
      </div>

      <div className="pagination-controls" style={{ marginTop: '20px' }}>
        <button onClick={goToPrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {/* --- Render the ConfirmModal --- */}
      <ConfirmModal
        show={showConfirmModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Customer;