import React, { useState } from 'react';
import './CategoryCarousel.css'; // We'll create this CSS file next

// Define categories - feel free to adjust these
const categories = [
  { id: 'all', name: 'All', icon: '🌐' }, // 'All' or 'Clear Filter' option
  { id: 'buildings', name: 'Buildings', icon: '🏢' },
  { id: 'parking', name: 'Parking', icon: '🅿️' },
  { id: 'dining', name: 'Dining', icon: '🍔' },
  { id: 'services', name: 'Services', icon: 'ℹ️' },
  // Add 'Events' if you have event markers with a specific category
  // { id: 'events', name: 'Events', icon: '🎉' },
];

/**
 * A horizontal carousel component displaying location category filters.
 * Intended primarily for the web/desktop view.
 *
 * @param {object} props - Component props.
 * @param {function} props.onSelectCategory - Callback function triggered when a category is selected. Receives the category ID as an argument.
 * @param {string} [props.className] - Optional additional CSS class names for the container.
 */
const CategoryCarousel = ({ onSelectCategory, className }) => {
  // State to track the currently active category button
  const [activeCategory, setActiveCategory] = useState('all'); // Default to 'all'

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    // Call the callback function passed from the parent component
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  return (
    // Apply the className passed from the parent (e.g., 'category-carousel-web')
    // This className is used in MainMapInterface.css to hide/show the component based on screen size
    <div className={`category-carousel-container ${className || ''}`}>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category.id)}
          title={`Filter by ${category.name}`}
          aria-pressed={activeCategory === category.id} // Accessibility: indicate pressed state
        >
          {/* You can use actual icons (<img> or icon font) instead of emojis */}
          <span className="category-icon" aria-hidden="true">{category.icon}</span>
          <span className="category-name">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryCarousel;
