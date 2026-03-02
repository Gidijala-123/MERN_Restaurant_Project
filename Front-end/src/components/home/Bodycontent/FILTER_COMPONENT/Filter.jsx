import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Chip, 
  Slider, 
  Button, 
  Paper,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CakeIcon from '@mui/icons-material/Cake';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import './Filter.css';

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: '4px',
  backgroundColor: selected ? '#FF6600' : '#F5F5F5',
  color: selected ? '#FFF' : '#666',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: selected ? '#E65C00' : '#EEEEEE',
  },
  border: 'none',
}));

const CategoryCard = styled(Box)(({ selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '15px',
  borderRadius: '20px',
  minWidth: '80px',
  cursor: 'pointer',
  backgroundColor: selected ? '#FF6600' : '#F5F5F5',
  color: selected ? '#FFF' : '#666',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
  }
}));

const PriceSlider = styled(Slider)({
  color: '#FF6600',
  height: 6,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#FF6600',
    border: '4px solid #FFF',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&::before': {
      display: 'none',
    },
  },
});

const Filter = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [selectedLocations, setSelectedLocations] = useState(['Near me']);
  const [selectedTags, setSelectedTags] = useState(['Open']);
  const [priceRange, setPriceRange] = useState([10, 70]);

  const categories = [
    { id: 'Drinks', icon: <LocalBarIcon /> },
    { id: 'Food', icon: <RestaurantIcon /> },
    { id: 'Cake', icon: <CakeIcon /> },
    { id: 'Snacks', icon: <FastfoodIcon /> }
  ];

  const locations = ['Bronx', 'Manhattan', 'Queens', 'Brooklyn', 'Staten Island', 'Near me'];
  const filterTags = ['Open', 'Sale off', 'Pick up', 'Verified', 'Preferred', 'Ordered'];

  const toggleLocation = (loc) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const clearAll = () => {
    setSelectedCategory('Food');
    setSelectedLocations(['Near me']);
    setSelectedTags(['Open']);
    setPriceRange([10, 70]);
  };

  return (
    <Box className="filter-overlay">
      <Paper elevation={0} className="filter-panel">
        {/* Header */}
        <Box className="filter-header">
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
          <Typography variant="h5" fontWeight={800}>Filter</Typography>
          <Button onClick={clearAll} className="clear-btn">Clear all</Button>
        </Box>

        {/* Content Scroll Area */}
        <Box className="filter-content">
          {/* Categories */}
          <Box className="category-scroll">
            {categories.map(cat => (
              <CategoryCard 
                key={cat.id} 
                selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon}
                <Typography variant="caption" sx={{ mt: 1, fontWeight: 700 }}>{cat.id}</Typography>
              </CategoryCard>
            ))}
          </Box>

          {/* Location */}
          <Box className="filter-section">
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Location</Typography>
            <Box className="chip-group">
              {locations.map(loc => (
                <FilterChip 
                  key={loc}
                  label={loc}
                  selected={selectedLocations.includes(loc)}
                  onClick={() => toggleLocation(loc)}
                  className={loc === 'Near me' ? 'near-me-chip' : ''}
                />
              ))}
            </Box>
          </Box>

          {/* Filter By */}
          <Box className="filter-section">
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Filter by</Typography>
            <Box className="chip-group">
              {filterTags.map(tag => (
                <FilterChip 
                  key={tag}
                  label={tag}
                  selected={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </Box>
          </Box>

          {/* Price */}
          <Box className="filter-section">
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>Price</Typography>
            <Box sx={{ px: 2, mt: 4 }}>
              <PriceSlider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="off"
                min={1}
                max={99}
              />
              <Box className="price-labels">
                <Typography variant="caption" color="#999">₹1</Typography>
                <Typography variant="body2" fontWeight={800}>₹{priceRange[0]}</Typography>
                <Typography variant="body2" fontWeight={800}>₹{priceRange[1]}</Typography>
                <Typography variant="caption" color="#999">₹99+</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Apply Button */}
        <Box className="filter-footer">
          <Button fullWidth className="apply-btn">Apply</Button>
        </Box>

        {/* Sticky Bottom Nav */}
        <Box className="bottom-nav">
          <Box className="nav-item active">
            <HomeIcon />
            <Typography variant="caption">Home</Typography>
          </Box>
          <Box className="nav-item">
            <ReceiptLongIcon />
            <Typography variant="caption">Order</Typography>
          </Box>
          <Box className="nav-item">
            <BookmarkBorderIcon />
            <Typography variant="caption">My List</Typography>
          </Box>
          <Box className="nav-item">
            <PersonOutlineIcon />
            <Typography variant="caption">Profile</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Filter;
