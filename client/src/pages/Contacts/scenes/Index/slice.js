import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getContacts } from '../services/contact'

const fetchContacts = createAsyncThunk(
  'users/fetchContactsStatus',
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
      state.contacts = action.meta.arg.page === 1 ? action.payload : [...state.contacts, ...action.payload]
    })
  }
})

export { fetchContacts }
export default slice.reducer
