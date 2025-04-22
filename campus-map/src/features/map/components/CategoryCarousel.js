import React, { useContext } from 'react'; // Import useContext
import { MapContext } from '../contexts/MapContext'; // Import MapContext
import './CategoryCarousel.css';

// Define categories - feel free to adjust these
// Ensure category IDs match expected values in MapOverlays filtering logic
const categories = [
  { id: 'all', name: 'All', icon: '🌐' },
  { id: 'buildings', name: 'Buildings', icon: '🏢' }, // General buildings
  { id: 'parking', name: 'Parking', icon: '🅿️' },   // Assumes data has 'parking' category/type
  { id: 'dining', name: 'Dining', icon: '🍔' },     // Assumes data has 'dining' category/type
  { id: 'services', name: 'Services', icon: 'ℹ️' }, // Assumes data has 'service' category/type
  // Add 'Events' if you have event markers with a specific category
  // { id: 'events', name: 'Events', icon: '🎉' },
  // Consider adding an 'Obstacles' category if needed
  // { id: 'obstacles', name: 'Obstacles', icon: '🚧' },
];

/**
 * A horizontal carousel component displaying location category filters.
 * Uses MapContext to manage the selected category state.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Optional additional CSS class names for the container.
 */
const CategoryCarousel = ({ className }) => {
  // Consume selectedCategory and setSelectedCategory from MapContext
  const { selectedCategory, setSelectedCategory } = useContext(MapContext);

  // No local state needed anymore for activeCategory

  const handleCategoryClick = (categoryId) => {
    // Call the context function to update the global state
    setSelectedCategory(categoryId);
  };

  return (
    <div className={`category-carousel-container ${className || ''}`}>
      {categories.map((category) => (
        <button
          key={category.id}
          // Use selectedCategory from context to determine active state
          className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category.id)}
          title={`Filter by ${category.name}`}
          // Use selectedCategory from context for aria-pressed
          aria-pressed={selectedCategory === category.id}
        >
          <span className="category-icon" aria-hidden="true">{category.icon}</span>
          <span className="category-name">{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryCarousel;
