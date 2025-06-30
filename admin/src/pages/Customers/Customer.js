import React, { useEffect, useState } from 'react';
import './Customer.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const customersPerPage = 10;

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
      }
    };

    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1); // reset to first page on search
  };

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
      {/* 🔍 Search Bar */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearch}
          className='search-bar'
       />
      
      <div className="list-table">
        <div className="list-table-format title">
          <b>User ID</b>
          <b>Name</b>
          <b>Email</b>
          <b>Contact Info</b>
        </div>

        {currentCustomers.map(user => (
          <div key={user.id} className="list-table-format">
            <p>user_{user.id}</p>
            <p>{user.firstName} {user.lastName}</p>
            <p>{user.email}</p>
            <p>{user.contactInfo}</p>
          </div>
        ))}
      </div>

      {/* 🔁 Pagination */}
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
    </div>
  );
};

export default Customer;
