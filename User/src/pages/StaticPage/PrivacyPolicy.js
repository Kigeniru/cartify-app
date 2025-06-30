import React from 'react';

// Main PrivacyPolicy component with a professional design
const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-inter">
      {/* Container for the privacy policy information */}
      <div className=" p-8 md:p-12 max-w-4xl w-full ">
        {/* Title Section */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8 leading-tight">
          Privacy Policy
        </h1>

        {/* Introduction */}
        <p className="text-lg md:text-xl text-justify text-gray-600 mb-10 max-w-2xl mx-auto">
          This Privacy Policy outlines the procedures concerning the collection, utilization, disclosure, and safeguarding of information obtained from users ("User" or "you") of our website. By accessing or using the Service, you signify your acceptance of the terms of this Privacy Policy.
        </p>

        {/* Policy Sections */}
        <div className="space-y-8 text-gray-700">
          {/* Information Collection */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Information Collection
            </h2>
            <p className="text-lg mb-3">
              We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about our products and services, participate in activities on the website, or contact us.
            </p>
            <ul className="list-disc list-inside text-lg space-y-2 pl-4">
              <li><strong className="text-gray-700">Personal Data:</strong> This may include, but is not limited to, names, postal addresses, email addresses, telephone numbers, and billing information.</li>
              <li><strong className="text-gray-700">Derivative Data:</strong> Information our servers automatically collect when you access the website, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the website.</li>
            </ul>
          </div>

          {/* Use of Information */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Use of Information
            </h2>
            <p className="text-lg">
              The information collected is utilized for various operational and analytical purposes, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-lg space-y-2 pl-4">
              <li>To facilitate the operation and maintenance of our Service.</li>
              <li>To provide notifications regarding alterations to our Service.</li>
              <li>To enable your participation in interactive features of our Service, as elected by you.</li>
              <li>To render effective customer support.</li>
              <li>To conduct data analysis and acquire valuable insights for Service enhancement.</li>
              <li>To monitor the utilization patterns of our Service.</li>
              <li>To identify, prevent, and resolve technical issues.</li>
              <li>To manage your account and registration as a user of the Service.</li>
              <li>To deliver targeted advertising, newsletters, and promotional materials.</li>
            </ul>
          </div>

          {/* Disclosure of Information */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Disclosure of Information
            </h2>
            <p className="text-lg">
              Your information may be disclosed in specific circumstances, as detailed herein:
            </p>
            <ul className="list-disc list-inside text-lg space-y-2 pl-4">
              <li><strong className="text-gray-700">By Law or to Protect Rights:</strong> We may disclose your information if legally required to do so, or if we believe such action is necessary to conform to the edicts of the law, comply with legal process served on us, protect and defend our rights or property, or act in urgent circumstances to protect the personal safety of users of the Service or the public.</li>
              <li><strong className="text-gray-700">Third-Party Service Providers:</strong> We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf. These services may include data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
              <li><strong className="text-gray-700">Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
              <li><strong className="text-gray-700">Affiliates:</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Data Security
            </h2>
            <p className="text-lg">
              While we endeavor to implement reasonable technical and organizational measures designed to protect the security of any personal information we process, please be aware that no method of transmission over the Internet, or method of electronic storage, is entirely secure. Therefore, we cannot guarantee the absolute security of your Personal Data.
            </p>
          </div>

          {/* Amendments to This Privacy Policy */}
          <div className="bg-gray-100 p-6 rounded-md border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Amendments to This Privacy Policy
            </h2>
            <p className="text-lg">
              We reserve the right to update or modify this Privacy Policy at any time. We will apprise you of any alterations by posting the revised Privacy Policy on this page. It is advised that you periodically review this Privacy Policy for any changes. Modifications to this Privacy Policy become effective upon their publication on this page.
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

export default PrivacyPolicy;
