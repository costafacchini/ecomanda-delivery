import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getContacts } from '../services/contact'

const fetchContacts = createAsyncThunk(
  'users/fetchContactsStatus',
  async (filters) => {
    const response = await getContacts(filters)
    return response.data
  }
)

const addContacts = createAsyncThunk(
  'users/addContactsStatus',
  async (filters) => {
    const response = await getContacts(filters)
    return response.data
  }
)

export const slice = createSlice({
  name: 'contacts',
  initialState: {
    contacts: [],
  },
  reducers: {
  },
  extraReducers: (builder)=>{
    builder.addCase(fetchContacts.fulfilled, (state, action)=>{
      state.contacts = action.payload
    })
    builder.addCase(addContacts.fulfilled, (state, action) => {
      state.contacts = [...state.contacts, ...action.payload]
    })
  }
})

export { fetchContacts, addContacts }
export default slice.reducer
