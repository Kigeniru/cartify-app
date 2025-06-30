import React from 'react';

// Main ProductCare component for Leche Flan
const ProductCare = () => {
  return (
     <div className="min-h-screen bg-white flex items-center justify-center p-4 font-inter">
      {/* Container for the product care information */}
      <div className="p-8 md:p-12 max-w-3xl w-full">
        {/* Title Section */}
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-8 leading-tight">
          Product Care
        </h1>

        {/* Introduction */}
        <p className="text-lg md:text-xl text-center text-gray-700 mb-10 max-w-2xl mx-auto">
          To ensure your delicious leche flan stays fresh and perfect, follow these simple care instructions.
        </p>

        {/* Care Sections */}
        <div className="space-y-10">
          {/* Storage Section */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-md border border-purple-200">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-4 flex items-center">
              <span className="mr-3 text-3xl"></span> Storage
            </h2>
            <ul className="list-disc list-inside text-gray-800 text-lg space-y-3">
              <li>
                <strong className="text-purple-600">Refrigeration is Key:</strong> Leche flan must be refrigerated immediately. Store it in an airtight container to prevent it from absorbing odors from other foods and to maintain its moisture.
              </li>
              <li>
                <strong className="text-purple-600">Shelf Life:</strong> Properly stored, leche flan can last for up to 3-5 days in the refrigerator. Beyond this, its quality may start to degrade.
              </li>
              <li>
                <strong className="text-purple-600">Avoid Freezing:</strong> Freezing is generally not recommended as it can alter the creamy texture of the flan, making it grainy or watery upon thawing.
              </li>
            </ul>
          </div>

          {/* Serving Section */}
          <div className="bg-pink-50 p-6 rounded-lg shadow-md border border-pink-200">
            <h2 className="text-2xl md:text-3xl font-bold text-pink-700 mb-4 flex items-center">
              <span className="mr-3 text-3xl"></span> Serving
            </h2>
            <ul className="list-disc list-inside text-gray-800 text-lg space-y-3">
              <li>
                <strong className="text-pink-600">Chill Before Serving:</strong> Leche flan is best served cold. If it has been out for a while, chill it in the refrigerator for at least 30 minutes before serving.
              </li>
              <li>
                <strong className="text-pink-600">Inverting:</strong> To beautifully invert the flan onto a serving plate, gently run a thin knife around the edges of the pan. Place your serving plate on top of the pan and quickly flip it over. The caramel will drizzle down, creating a glistening glaze.
              </li>
              <li>
                <strong className="text-pink-600">Portioning:</strong> Use a sharp, clean knife to cut neat slices. For individual servings, small ramekins are ideal.
              </li>
            </ul>
          </div>

          {/* Handling Tips Section */}
          <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-4 flex items-center">
              <span className="mr-3 text-3xl"></span> Handling Tips
            </h2>
            <ul className="list-disc list-inside text-gray-800 text-lg space-y-3">
              <li>
                <strong className="text-green-600">Gentle Handling:</strong> Leche flan is delicate. Handle it gently to avoid cracks or breakage, especially when transferring it.
              </li>
              <li>
                <strong className="text-green-600">Clean Utensils:</strong> Always use clean utensils when serving to prevent contamination and extend its freshness.
              </li>
              <li>
                <strong className="text-green-600">Presentation:</strong> For an extra touch, you can garnish your leche flan with fresh berries, a sprinkle of toasted coconut, or a mint leaf.
              </li>
            </ul>
          </div>
        </div>

        {/* Closing remark */}
        <p className="text-center text-gray-600 mt-10 text-md md:text-lg">
          Enjoy your perfectly cared-for leche flan!
        </p>
      </div>
    </div>
  );
};

export default ProductCare;
