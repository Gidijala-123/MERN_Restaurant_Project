# Indian Restaurant Menu System - Implementation Guide

## Overview

The MERN Restaurant application has been completely refactored to support a comprehensive Indian restaurant menu system with proper categorization, filtering, and responsive UI.

## Architecture

### 1. **Menu Data Structure** (`src/data/menuData.js`)

- Contains 69 Indian food items with complete metadata
- **Fields per item:**
  - `id`: Unique identifier
  - `name`: Item name
  - `category`: Main category (e.g., "Starters", "Main Course")
  - `subCategory`: Sub-category for grouped display
  - `price`: Item price in INR
  - `rating`: 5-star rating (4.0 - 4.9)
  - `reviews`: Number of reviews
  - `calories`: Caloric value
  - `serves`: Number of servings
  - `imageUrl`: Image path
  - `description`: Short description
  - `veg`: Boolean for vegetarian/non-vegetarian

### 2. **Categories & Structure**

#### Main Categories:

1. **Hot Offers** - Special discounted items
2. **Starters**
   - Veg Starters (Samosa, Paneer Tikka, etc.)
   - Non-Veg Starters (Chicken Tikka, Tandoori Prawns)
   - Kebabs/Tandoor (Seekh Kebab, Paneer Skewers)

3. **Main Course**
   - Paneer Specialities (Butter Masala, Tikka Masala, Palak Paneer)
   - Chicken/Mutton Curries (Butter Chicken, Chettinad, Rogan Josh, Vindaloo)
   - Dal/Lentils (Dal Makhani, Chana Masala, Rajma)

4. **Rice & Biryani**
   - Hyderabadi Biryani (Veg, Chicken, Mutton)
   - Pulao (Veg, Chicken)
   - Flavored Rice (Jeera Rice, Lemon Rice)

5. **Breads**
   - Naan (Butter, Garlic, Cheesy, Paneer Kulcha)
   - Roti (Chapati, Missi Roti)
   - Paratha (Aloo, Gobi, Paneer)

6. **South Indian**
   - Dosa (Masala, Paper Roast, Chicken)
   - Idli (Plain, Ghee Roast)
   - Vada (Medu Vada)

7. **Chinese**
   - Noodles (Hakka, Chicken, Garlic Chilli)
   - Manchurian (Veg, Chicken, Paneer)
   - Fried Rice (Veg, Egg, Chicken)

8. **Beverages**
   - Lassi (Sweet, Mango, Rose)
   - Soft Drinks (Lemonade, Sugarcane Juice)
   - Shakes (Strawberry, Chocolate, Banana)
   - Mocktails (Virgin Mojito, Pineapple Punch)

9. **Desserts**
   - Gulab Jamun (Regular, Kesar)
   - Ice Creams (Vanilla, Mango, Kulfi)
   - Traditional Sweets (Kheer, Rasgulla, Jalebi)

## Components & Files

### New Components:

1. **MenuContext.jsx** (`src/context/MenuContext.jsx`)
   - Global state management for menu filtering
   - Provides: `selectedCategory`, `selectedSubCategory`, `filteredItems`
   - Methods: `handleCategoryChange()`, `handleSubCategoryChange()`

2. **MenuDisplay.jsx** (`src/components/home/Bodycontent/MenuDisplay.jsx`)
   - Main display component for menu items
   - Responsive grid layout (12 cols on desktop, responsive on mobile)
   - Features:
     - Subcategory filter chips (orange highlight for active)
     - Item cards with hover effects
     - Veg/Non-Veg badges
     - Star ratings with review count
     - Nutrition info (calories, servings)
     - Add to cart functionality
     - Favorite button

3. **MenuDisplay.css** (`src/components/home/Bodycontent/MenuDisplay.css`)
   - Complete responsive styling
   - Orange theme matching the UI (#FF8C00)
   - Mobile-first approach
   - Smooth animations and transitions

### Modified Components:

1. **Sidebar.jsx** (`src/components/home/Sidebar/Sidebar.jsx`)
   - Updated categories list
   - Integration with MenuContext
   - Updated icons for Indian menu
   - Category selection triggers menu filtering

2. **Bodycontent.jsx** (`src/components/home/Bodycontent/Bodycontent.jsx`)
   - Conditional rendering of MenuDisplay for Indian menu
   - Maintains backward compatibility with legacy components
   - Uses MenuContext to display appropriate content

3. **Sidebar.jsx (APIs)** (`src/APIs/Sidebar.jsx`)
   - New SidebarData structure with Indian categories
   - Added subcategories for each main category
   - Updated icons (uses react-icons)

4. **App.jsx** (`src/App.jsx`)
   - Wrapped with MenuProvider for global state access

## Styling & Responsive Design

### Color Scheme:

- **Primary Orange**: #FF8C00 (CTA buttons, active states)
- **Hover Orange**: #e67e00 (Button hover)
- **Text Gray**: #333, #666, #999
- **Background**: #f5f5f5, #f0f0f0
- **White**: #fff

### Responsive Breakpoints:

- **Desktop (lg)**: 4 columns grid, full sidebar
- **Tablet (md)**: 3 columns grid, collapsible sidebar
- **Mobile (sm)**: 2 columns grid, drawer sidebar
- **Small Mobile (xs)**: 1 column grid, full-width cards

### UI Components:

- **Cards**: Material-UI Card with hover lift effect
- **Chips**: Category and nutritional info
- **Rating**: 5-star rating display
- **Buttons**: Orange gradient buttons with hover effects
- **Grid**: Responsive Material-UI Grid system

## Data Handling

### Helper Functions (menuData.js):

```javascript
// Get all items in a category
getItemsByCategory(category) → Array

// Get items by category and subcategory
getItemsBySubCategory(category, subCategory) → Array

// Get subcategories for a category
getSubCategoriesByCategory(category) → Array

// Get all unique categories
getAllCategories() → Array
```

### Context Hooks:

```javascript
// Use menu context
const {
  selectedCategory,
  selectedSubCategory,
  filteredItems,
  handleCategoryChange,
  handleSubCategoryChange,
  getSubCategories,
} = useMenu();
```

## User Flow

1. **Sidebar Category Click**
   - User clicks category (e.g., "Starters")
   - `handleCategoryChange()` updates MenuContext
   - `selectedCategory` state changes
   - Bodycontent detects change and displays MenuDisplay

2. **Subcategory Filter**
   - MenuDisplay shows filter chips for subcategories
   - User clicks subcategory chip
   - `handleSubCategoryChange()` updates filter
   - Grid re-renders showing filtered items

3. **Add to Cart**
   - User clicks "ADD" button on item card
   - Dispatches Redux action with item data
   - Item added to shopping cart

4. **Favorites**
   - User clicks favorite icon
   - Local state toggled
   - Heart icon changes color to orange

## Integration Steps

### 1. Frontend Setup:

```bash
# Ensure dependencies are installed
npm install

# Start development server
npm run dev
```

### 2. Image Paths:

- Images should be placed in `public/menu-images/`
- Fallback: Uses unsplash if image not found
- Format: JPG/PNG, optimized for web

### 3. Redux Integration:

- MenuDisplay uses Redux for cart management
- No additional Redux setup required
- Uses existing `addToCart` action

## Features

✅ **Category Filtering** - Select main categories from sidebar
✅ **Subcategory Grouping** - Items grouped by subcategory
✅ **Responsive Design** - Works on all devices
✅ **Add to Cart** - Integrated with Redux
✅ **Favorites** - Toggle favorite items
✅ **Card Design** - Professional food item display
✅ **Nutrition Info** - Calories and serving size
✅ **Ratings** - 5-star rating with review count
✅ **Veg/Non-Veg Badge** - Visual indicator
✅ **Smooth Animations** - Hover effects and transitions

## Performance Considerations

1. **Lazy Loading**: MenuDisplay is lazy-loaded via React.lazy()
2. **Code Splitting**: Separate CSS file for menu styles
3. **Memoization**: Context uses useCallback for functions
4. **Responsive Images**: Lazy loading attribute on images

## Future Enhancements

1. **Backend Integration**: Replace mock data with API calls
2. **Database Schema**: Mongoose schema for menu items
3. **Admin Panel**: CRUD operations for menu items
4. **Search**: Implement search across menu items
5. **Sorting**: Sort by price, rating, popularity
6. **Filters**: Additional filters (price range, dietary preferences)
7. **Reviews**: User reviews and ratings
8. **Combo Deals**: Special package offers
9. **Delivery Time**: Estimated prep time
10. **Customization**: Ingredient customization for items

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Accessibility

- Material-UI components include ARIA labels
- Semantic HTML structure
- Keyboard navigation support
- Color contrast meets WCAG standards

## Troubleshooting

### Issue: MenuDisplay not showing

**Solution**: Ensure MenuProvider is wrapping the app in App.jsx

### Issue: Images not loading

**Solution**: Check image paths in imageUrl, place images in public/menu-images/

### Issue: Category filter not working

**Solution**: Verify category name matches exactly (case-sensitive)

### Issue: "useMenu must be used within a MenuProvider"

**Solution**: Wrap component tree with MenuProvider in App.jsx

## Notes

- All menu data is mock data and can be replaced with API calls
- Prices are in INR (₹)
- Images use Unsplash fallback if local images aren't found
- Component is fully responsive and mobile-optimized
- Dark mode support via existing theme context

---

**Last Updated**: March 2026
**Version**: 1.0
