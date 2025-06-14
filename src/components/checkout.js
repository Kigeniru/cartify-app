import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from '../styles/checkout.module.css';
import icon from "../assets/mvillo-logo.png";
import qrImg from "../assets/mvillo-qr.png";
import Tesseract from 'tesseract.js';  

const Checkout = () => {
  const [proof, setProof] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    referenceNumber: '',
    dateTime: '',
    mobileNumber: '',
  });
  const navigate = useNavigate(); 

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProof(file);
      processImage(file);
    }
  };

  const processImage = (file) => {
    const reader = new FileReader();
    reader.onload = function () {
      Tesseract.recognize(reader.result, 'eng', { logger: m => console.log(m) })
        .then(({ data: { text } }) => {
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          let referenceNumber = '';
          let dateTime = '';
          let mobileNumber = '';

          const referenceRegex = /\b(?:ref(?:erence)?\s*(?:no)?\.?\:?)?\s*(\d{6,})\b/i;
          const datePatterns = [
            /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\s+\d{1,2}:\d{2}(?:\s*(?:AM|PM))?/i,
            /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s+\d{1,2}:\d{2}/i,
            /\b\d{4}[-/]\d{2}[-/]\d{2}\s+\d{1,2}:\d{2}/
          ];

          for (let line of lines) {
            const cleanedLine = line
              .replace(/[^a-zA-Z0-9\s:.,+()-]/g, '')
              .replace(/O/g, '0')
              .replace(/Aprii?/gi, 'April');

            if (!dateTime) {
              for (let pattern of datePatterns) {
                const match = cleanedLine.match(pattern);
                if (match) {
                  dateTime = match[0];
                  break;
                }
              }
            }

            if (!referenceNumber && /ref/i.test(cleanedLine)) {
              const refMatch = cleanedLine.match(referenceRegex);
              if (refMatch) {
                referenceNumber = refMatch[1];
              }
            }

            if (!mobileNumber) {
              const normalizedLine = cleanedLine.replace(/\s+/g, '');
              const phoneMatch = normalizedLine.match(/(\+63\d{10}|09\d{9})/);
              if (phoneMatch) {
                mobileNumber = phoneMatch[0];
              }
            }
          }

        
          setPaymentDetails({
            referenceNumber,
            dateTime,
            mobileNumber,
          });

        
          localStorage.setItem("paymentDateTime", dateTime);
          localStorage.setItem("paymentRef", referenceNumber);
          localStorage.setItem("paymentMobile", mobileNumber);
        })
        .catch(err => {
          console.error('Error processing image: ', err);
        });
    };
    reader.readAsDataURL(file);
  };

  const proceedToDelivery = () => {
    navigate('/delivery');
  };

  return (
    <div>
      <header className={styles.header}>
        <div className={styles['header-left']}>
          <div className={styles.logo}>
            <img src={icon} alt="Site Icon" />
          </div>
          <nav>
            <a href="/login" className="active">Home</a>
            <a href="/cart">Cart</a>
            <a href="/contact">Contact Us</a>
          </nav>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles['payment-card']}>
          <div className={styles['payment-logo']}>
            GCash Payment
          </div>

          <div className={styles['qr-code']}>
            {/* Use the imported qrImg here */}
            <img src={qrImg} alt="GCash QR" width="200" />
          </div>

          <p>Scan the QR code above to complete your payment.</p>
<p className={styles['contact-number']}>+63 927 481 1100</p>

          
          {/* File upload section */}
          <input 
            type="file" 
            className={styles['upload-btn']} 
            onChange={handleFileUpload}
          />
          
          {proof && (
            <div className={styles['proof-preview']}>
              <p>Uploaded File: {proof.name}</p>
            </div>
          )}

          {/* Show extracted payment details */}
          <div className={styles['payment-details']}>
            <p><strong>Date & Time:</strong> {paymentDetails.dateTime || 'Not found'}</p>
            <p><strong>Reference Number:</strong> {paymentDetails.referenceNumber || 'Not found'}</p>
            <p><strong>Mobile Number:</strong> {paymentDetails.mobileNumber || 'Not found'}</p>
          </div>

          {/* Proceed to Delivery Button */}
          <button 
            className={styles['proceed-btn']} 
            onClick={proceedToDelivery} 
            disabled={!proof}  // Disable the button if proof is not uploaded
          >
            Proceed to Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
