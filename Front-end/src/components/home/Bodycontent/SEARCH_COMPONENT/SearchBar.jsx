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
  const [inputValue, setInputValue] = React.useState("");
  const debounced = useDebounce(inputValue, 300);

  const memoizedProducts = React.useMemo(() => products || [], [products]);

  // Filter options to only those matching the current input
  const filteredOptions = React.useMemo(() => {
    if (!inputValue || inputValue.length < 1) return [];
    const q = inputValue.toLowerCase();
    return memoizedProducts.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.decrp || "").toLowerCase().includes(q)
    ).slice(0, 8); // cap at 8 suggestions
  }, [inputValue, memoizedProducts]);

  const getOptionLabel = React.useCallback((option) => {
    if (typeof option === "string") return option;
    return option.title || "";
  }, []);

  // When user picks a suggestion from dropdown
  const handleChange = React.useCallback(
    (event, newValue) => {
      if (newValue && onSearchChange) {
        const term = typeof newValue === "string" ? newValue : newValue.title || "";
        setInputValue(term);
        onSearchChange("Shop", term);
      }
    },
    [onSearchChange],
  );

  const handleInputChange = React.useCallback((e, value, reason) => {
    setInputValue(value);
    // Clear search when user clears the field
    if (!value && onSearchChange) {
      onSearchChange("Home", "");
    }
  }, [onSearchChange]);

  // Trigger search as user types (debounced)
  React.useEffect(() => {
    if (debounced && debounced.length >= 2 && onSearchChange) {
      onSearchChange("Shop", debounced);
    }
  }, [debounced, onSearchChange]);

  return (
    <Stack spacing={2} sx={{ width: "100%", maxWidth: { xs: "100%", md: 500 } }} className="search-main-div">
      <Autocomplete
        freeSolo
        id="product-search-bar"
        disableClearable
        options={filteredOptions}
        getOptionLabel={getOptionLabel}
        inputValue={inputValue}
        onChange={handleChange}
        onInputChange={handleInputChange}
        filterOptions={(x) => x} // we handle filtering ourselves
        renderOption={(props, option) => (
          <li {...props} key={option.id || option.title}>
            <span style={{ fontSize: "0.85rem" }}>{option.title}</span>
            {option.category && (
              <span style={{ fontSize: "0.72rem", color: "#9ca3af", marginLeft: "auto" }}>
                {option.category}
              </span>
            )}
          </li>
        )}
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
                  <SearchIcon sx={{ color: "var(--primary)", opacity: 0.7, transition: "all 0.3s ease" }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: "25px",
                backgroundColor: "var(--white)",
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                transition: "all 0.3s ease",
                "& .MuiInputBase-input": {
                  color: "var(--text-main)",
                  "&::placeholder": { color: "var(--text-sub)", opacity: 1 },
                },
                "& fieldset": { borderColor: "var(--border-light)" },
                "&:hover fieldset": { borderColor: "var(--primary)" },
                "&.Mui-focused fieldset": { borderColor: "var(--primary)" },
              },
            }}
          />
        )}
      />
    </Stack>
  );
});

export default SearchBar;
