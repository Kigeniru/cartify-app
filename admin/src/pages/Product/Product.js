import React, { useEffect, useState } from 'react';
import './Product.css';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

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
      }
    };

    fetchData();
  }, []);

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
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />

        <select
          className="sort-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>

        {products
          .filter(product =>
            product.name.toLowerCase().includes(search) &&
            (categoryFilter === '' || product.category === categoryFilter)
          )
          .map((product) => (
            <div key={product.id} className="list-table-format">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-image"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              />
              <p>{product.name}</p>
              <p>{product.category}</p>
              <p>₱{product.price}</p>
              <button onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Product;
