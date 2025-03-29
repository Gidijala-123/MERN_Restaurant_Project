import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  items: [],
  status: null,
};

export const productsFetch = createAsyncThunk(
  "products/productsFetch",
  async (id = null, rejectWithValue) => {
    try {
      const response = await axios.get("https://localhost:1234/products");
      //  It'll handle error if data is not found in response.data
      return response?.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  //   this is will generate action creators and handle the action types
  reducers: {},
  //   this will won't generate action creators, it only handle action types
  extraReducers: {
    // here we'll handle reducer fulfilled, pending, rejected states from productsFetch response
    [productsFetch.pending]: (state, action) => {
      // in redux we can directly update the state from here
      state.status = "pending";
    },
    [productsFetch.fulfilled]: (state, action) => {
      // in redux we can directly update the state from here
      state.status = "success";
      state.items = action.payload;
    },
    [productsFetch.rejected]: (state, action) => {
      // in redux we can directly update the state from here
      state.status = "rejected";
      state.err = action.payload;
    },
  },
});

export default productsSlice.reducer;
