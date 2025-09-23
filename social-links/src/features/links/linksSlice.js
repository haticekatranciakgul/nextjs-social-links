import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// Kullanıcının linklerini çek
export const fetchLinks = createAsyncThunk("links/fetchLinks", async (uid) => {
  const snapshot = await getDocs(collection(db, "users", uid, "links"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});

// Yeni link ekle
export const addLink = createAsyncThunk("links/addLink", async ({ uid, link }) => {
  const docRef = await addDoc(collection(db, "users", uid, "links"), link);
  return { id: docRef.id, ...link };
});

// Link sil
export const deleteLink = createAsyncThunk("links/deleteLink", async ({ uid, id }) => {
  await deleteDoc(doc(db, "users", uid, "links", id));
  return id;
});

const linksSlice = createSlice({
  name: "links",
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLinks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addLink.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteLink.fulfilled, (state, action) => {
        state.items = state.items.filter((link) => link.id !== action.payload);
      });
  },
});

export default linksSlice.reducer;
