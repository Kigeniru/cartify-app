import React from 'react';

// Main TermsAndConditions component with a professional design
const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-inter">
      {/* Container for the terms and conditions information */}
      <div className=" p-8 md:p-12 max-w-4xl w-full">
        {/* Title Section */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8 leading-tight">
          Terms and Conditions
        </h1>

        {/* Introduction */}
        <p className="text-lg md:text-xl text-justify text-gray-600 mb-10 max-w-2xl mx-auto">
          Welcome to Mvillo! These Terms and Conditions ("Terms") govern your use of our website and the food delivery services provided through it. By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any services.
        </p>

        {/* Policy Sections */}
        <div className="space-y-8 text-gray-700">
          {/* Acceptance of Terms */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-lg text-justify">
              By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement. Additionally, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services, which may be posted and modified from time to time. All such guidelines or rules are hereby incorporated by reference into these Terms and Conditions.
            </p>
          </div>

          {/* Service Description */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              2. Service Description
            </h2>
            <p className="text-lg text-justify">
              Mvillo provides an online platform through which users can order Leche Flan and related dessert products for delivery to specified locations. Our service includes the processing of orders, secure payment handling, and coordination of delivery.
            </p>
          </div>

          {/* User Registration and Accounts */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              3. User Registration and Accounts
            </h2>
            <p className="text-lg text-justify mb-3">
              To access certain features of the Service, you may be required to register for an account. When creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside text-lg space-y-2 pl-4">
              <li>Provide accurate, current, and complete information.</li>
              <li>Maintain the security of your password and identification.</li>
              <li>Promptly update account information to keep it accurate and complete.</li>
              <li>Accept all risks of unauthorized access to information and account.</li>
            </ul>
          </div>

          {/* Orders and Payments */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              4. Orders and Payments
            </h2>
            <ul className="list-disc list-inside text-lg space-y-2 pl-4">
              <li><strong className="text-gray-700">Order Confirmation:</strong> All orders placed through our website are subject to acceptance and availability. An order confirmation will be sent to your registered email address.</li>
              <li><strong className="text-gray-700">Pricing:</strong> Prices for products are as listed on the website and are subject to change without prior notice.</li>
              <li><strong className="text-gray-700">Payment:</strong> Payment must be made at the time of order placement through the accepted payment methods.</li>
              <li><strong className="text-gray-700">Cancellations:</strong> Orders cannot be cancelled once they have been confirmed and dispatched for delivery. For cancellation requests prior to dispatch, please contact customer support.</li>
            </ul>
          </div>

          {/* Delivery Policy */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              5. Delivery Policy
            </h2>
            <ul className="list-disc list-inside text-lg space-y-2 pl-4">
              <li><strong className="text-gray-700">Delivery Times:</strong> Estimated delivery times are provided for convenience only and are not guaranteed. Delays may occur due to unforeseen circumstances.</li>
              <li><strong className="text-gray-700">Delivery Address:</strong> It is your responsibility to provide an accurate and complete delivery address. We are not liable for non-delivery or late delivery resulting from incorrect address information.</li>
              <li><strong className="text-gray-700">Receipt of Goods:</strong> Upon delivery, the recipient must inspect the Leche Flan for any damage or discrepancies before accepting the order.</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              6. Intellectual Property Rights
            </h2>
            <p className="text-lg text-justify">
              Unless otherwise indicated, the website is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the website (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-lg text-justify">
              To the fullest extent permitted by applicable law, in no event shall Mvillo, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
            </p>
          </div>

          {/* Governing Law */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              8. Governing Law
            </h2>
            <p className="text-lg text-justify">
              These Terms shall be governed and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-lg text-justify">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
            </p>
          </div>

          {/* Contact Information */}
          
        </div>

        {/* Closing remark */}
        <p className="text-center text-gray-500 mt-10 text-md md:text-lg">
          Last updated: June 19, 2025
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
