import * as React from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import "./SearchBar.css";
import useDebounce from "../../../../hooks/useDebounce";

const SearchBar = React.memo(function SearchBar({ onSearchChange }) {
  const { items: products } = useSelector((state) => state.products);
  const [searchValue, setSearchValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const debounced = useDebounce(inputValue, 400);

  // Memoize products list to prevent unnecessary recalculations
  const memoizedProducts = React.useMemo(() => products || [], [products]);

  // Memoize getOptionLabel function
  const getOptionLabelMemo = React.useCallback((option) => {
    if (typeof option === "string") return option;
    return option.title || "";
  }, []);

  // Memoize handleSearchChange callback
  const handleSearchChange = React.useCallback(
    (event, newValue) => {
      setSearchValue(newValue);
      if (newValue && onSearchChange) {
        onSearchChange("Shop");
      }
    },
    [onSearchChange],
  );

  // Memoize onInputChange callback
  const handleInputChange = React.useCallback((e, value) => {
    setInputValue(value);
  }, []);

  React.useEffect(() => {
    if (debounced && debounced.length >= 2 && onSearchChange) {
      onSearchChange("Shop");
    }
  }, [debounced, onSearchChange]);

  return (
    <Stack
      spacing={2}
      sx={{ width: "100%", maxWidth: { xs: "100%", md: 500 } }}
      className="search-main-div"
    >
      <Autocomplete
        freeSolo
        id="product-search-bar"
        disableClearable
        options={memoizedProducts}
        getOptionLabel={getOptionLabelMemo}
        value={searchValue}
        onChange={handleSearchChange}
        onInputChange={handleInputChange}
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
                  <SearchIcon sx={{ 
                    color: "var(--primary)",
                    opacity: 0.7,
                    transition: "all 0.3s ease",
                  }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "25px",
                backgroundColor: "var(--white)",
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                transition: "all 0.3s ease",
                "& .MuiInputBase-input": {
                  color: "var(--text-main)",
                  "&::placeholder": {
                    color: "var(--text-sub)",
                    opacity: 1,
                  },
                },
                "& fieldset": {
                  borderColor: "var(--border-light)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--primary)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary)",
                },
                "&:hover .MuiSvgIcon-root": {
                  opacity: 1,
                  transform: "scale(1.1)",
                }
              },
            }}
          />
        )}
      />
    </Stack>
  );
});

export default SearchBar;
