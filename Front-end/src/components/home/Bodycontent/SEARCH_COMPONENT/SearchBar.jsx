import * as React from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import './SearchBar.css'

export default function SearchBar({ onSearchChange }) {
  const { items: products } = useSelector((state) => state.products);
  const [searchValue, setSearchValue] = React.useState(null);

  const handleSearchChange = (event, newValue) => {
    setSearchValue(newValue);
    if (newValue && onSearchChange) {
      // If the selected item has a category, we could navigate there
      // For now, let's assume searching takes them to Shop or stays on Home
      onSearchChange("Shop");
    }
  };

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: { xs: '100%', md: 500 } }} className="search-main-div">
      <Autocomplete
        freeSolo
        id="product-search-bar"
        disableClearable
        options={products || []}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return option.title || '';
        }}
        value={searchValue}
        onChange={handleSearchChange}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search for delicious food..."
            variant="outlined"
            size="small"
            InputProps={{
              ...params.InputProps,
              type: "search",
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#ed1f24' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '25px',
                backgroundColor: 'var(--white)',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                '& .MuiInputBase-input': {
                  color: 'var(--text-main)',
                  '&::placeholder': {
                    color: 'var(--text-sub)',
                    opacity: 1,
                  },
                },
                '& fieldset': {
                  borderColor: 'var(--border-light)',
                },
                '&:hover fieldset': {
                  borderColor: 'var(--primary)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--primary)',
                },
              }
            }}
          />
        )}
      />
    </Stack>
  );
}
