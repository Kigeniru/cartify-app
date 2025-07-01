import React, { useEffect, useState } from 'react';
import './StaticPages.css';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StaticPages = () => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'StaticPages'));
        const pagesArray = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPages(pagesArray);
      } catch (error) {
        console.error("Error fetching pages:", error);
        toast.error("Failed to fetch static pages.");
      }
    };

    fetchPages();
  }, []);

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    setEditedContent(page.content || '');
  };

  const handleSave = async () => {
    if (!selectedPage) return;
    try {
      await updateDoc(doc(db, 'StaticPages', selectedPage.id), {
        content: editedContent,
      });
      toast.success(`${selectedPage.title} updated successfully!`);
      setSelectedPage(null);
      setEditedContent('');
    } catch (error) {
      console.error("Error updating page:", error);
      toast.error("Failed to update the page.");
    }
  };

  return (
    <div className="static-pages-container flex-col">
      <h2 className="header">Edit Static Pages</h2>
      <hr className="thick-hr" />

      <div className="static-page-list">
        {pages.map(page => (
          <button
            key={page.id}
            className={`page-button ${selectedPage?.id === page.id ? 'active' : ''}`}
            onClick={() => handleSelectPage(page)}
          >
            {page.title}
          </button>
        ))}
      </div>

      {selectedPage && (
        <div className="editor-container">
          <h3>{selectedPage.title}</h3>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={15}
            className="content-editor"
          />
          <button onClick={handleSave} className="save-btn">Save Changes</button>
        </div>
      )}
    </div>
  );
};

export default StaticPages;
