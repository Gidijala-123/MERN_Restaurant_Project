import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  items: [],
  status: null,
};

export const productsFetch = createAsyncThunk(
  "products/productsFetch",
  async (id = null, { rejectWithValue }) => {
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 
        (window.location.hostname === "localhost" ? "http://127.0.0.1:1111" : window.location.origin)
      ).replace(/\/$/, "");
      const response = await axios.get(`${baseUrl}/products`, {
        withCredentials: true,
      });
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(productsFetch.pending, (state) => {
        state.status = "pending";
      })
      .addCase(productsFetch.fulfilled, (state, action) => {
        state.status = "success";
        state.items = action.payload;
      })
      .addCase(productsFetch.rejected, (state, action) => {
        state.status = "rejected";
        state.err = action.payload;
      });
  },
});

export default productsSlice.reducer;
