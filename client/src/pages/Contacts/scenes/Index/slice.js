import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getContacts } from '../services/contact'

const fetchContacts = createAsyncThunk(
  'users/fetchByIdStatus',
  async () => {
    const response = await getContacts()
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
  }
})

export { fetchContacts }
export default slice.reducer
