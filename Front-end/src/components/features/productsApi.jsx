import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" ? window.location.origin : "http://127.0.0.1:1111")}`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => "products",
    }),
  }),
});

// creating a custom hook that can be access over the app
export const { useGetAllProductsQuery } = productsApi;
